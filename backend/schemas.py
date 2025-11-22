from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RobotEventOut(BaseModel):
    timestamp: datetime
    source: str
    event_type: str
    payload: str

    class Config:
        orm_mode = True


class RobotStateOut(BaseModel):
    joint_0: Optional[int]
    joint_1: Optional[int]
    joint_2: Optional[int]
    joint_3: Optional[int]
    joint_4: Optional[int]
    joint_5: Optional[int]
    joint_6: Optional[int]
    gripper: str
    updated_at: datetime

    class Config:
        orm_mode = True
