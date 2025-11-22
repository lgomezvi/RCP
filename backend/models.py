from sqlalchemy import Column, Integer, String, DateTime, Text # all the different column types
from sqlalchemy.orm import declarative_base # the parent class for all ORM models ( python classes that represent database tables)
from datetime import datetime

Base = declarative_base() # when we pass this to sqlalchemy, it knows these are ORM models (that is why both are taking Base as argument)

class RobotEvent(Base):
    __tablename__ = "robot_events"
     # this class represents the current state of the robot, what did we send, what did ardi reply, when did error happen, what is last state message?

    # we will only keep appending to this database 

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String, index=True)      # backend/ros/arduino/agent
    event_type = Column(String, index=True)  # command/state/error/ack
    payload = Column(Text)                   # JSON or string


class RobotState(Base):
    __tablename__ = "robot_state"

    # there will be only one row in this table, representing the current state of the robot - when arudino sends a state nessage we update thsi single row

    id = Column(Integer, primary_key=True)
    joint_0 = Column(Integer)
    joint_1 = Column(Integer)
    joint_2 = Column(Integer)
    joint_3 = Column(Integer)
    joint_4 = Column(Integer)
    joint_5 = Column(Integer)
    joint_6 = Column(Integer)

    gripper = Column(String)                 # "open" or "closed"
    updated_at = Column(DateTime, default=datetime.utcnow)
