# this is where the SQLAlchemy ORM models and database session are defined.
# an ORM model is basically python classes that represent database tables.
# each attribute of the class represents a column in the table and each instance is a row in the table.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from .models import Base, RobotEvent, RobotState

# note that sqlite is a file based database, so the database will be stored in a file called robot.db in the same directory as this script (yes only 1 file in your disk crazy right?)


DATABASE_URL = "sqlite:///robot.db" 
# here the /// basically means that the database file is in the same directory as the script (create if no exists)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}) # this is false so multiple threads can access the db this part is what is actually creating the database. 
SessionLocal = sessionmaker(bind=engine, autoflush=False) # guarantees that changes are not automatically flushed to the database until we explicitly commit them (its a session)

# Create tables
Base.metadata.create_all(bind=engine) # so will make both tables we have defined in model.py 


# EVENT LOGGING
def log_event(source, event_type, payload):
    db = SessionLocal()
    event = RobotEvent(source=source, event_type=event_type, payload=payload)
    db.add(event)
    db.commit()
    db.close()
    # full life cycle of a session: create session, add object, commit changes, close session (liberates the resources)


# GET EVENTS
def get_recent_events(limit=50):
    db = SessionLocal()
    events = (
        db.query(RobotEvent)
        .order_by(RobotEvent.timestamp.desc())
        .limit(limit)
        .all()
    )
    db.close()
    return events


# UPDATE STATE
def update_robot_state(joint_values, gripper="unknown"):
    """
    joint_values: dict like {0: angle, 1: angle, ...}
    """
    db = SessionLocal()
    state = db.query(RobotState).first()

    if not state:
        state = RobotState(id=1)  # create initial row

    # update joints
    for j in range(6): # this will change based on the amount of joins we have 
        setattr(state, f"joint_{j}", joint_values.get(j, getattr(state, f"joint_{j}", 0)))

    state.gripper = gripper
    state.updated_at = datetime.utcnow()

    db.add(state)
    db.commit()
    db.close()


# GET STATE
def get_robot_state():
    db = SessionLocal()
    state = db.query(RobotState).first()
    db.close()
    return state
