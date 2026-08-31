from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, Enum as SqlEnum, ForeignKey, JSON
from backend.app.db.base_class import Base

class RequestStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class TeamRequestProfile(Base):
    __tablename__ = "team_request_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    skills_have = Column(JSON, nullable=False)  # e.g., ["React", "Tailwind"]
    skills_needed = Column(JSON, nullable=False)  # e.g., ["Node.js", "Figma"]
    experience_level = Column(String, nullable=False)  # Beginner, Intermediate, Advanced
    timezone = Column(String, nullable=False)

class TeammateMatch(Base):
    __tablename__ = "teammate_matches"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    status = Column(SqlEnum(RequestStatus), default=RequestStatus.PENDING, nullable=False)
