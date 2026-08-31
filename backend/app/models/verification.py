from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, Enum as SqlEnum, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base

class VerificationTier(str, Enum):
    NONE = "none"
    STUDENT = "student"
    ORGANIZATION = "organization"
    MANUAL_PENDING = "manual_pending"
    MANUAL_APPROVED = "manual_approved"

# Example fields to inject or mix into your existing User/Organization models
class UserVerificationMixin:
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_tier = Column(SqlEnum(VerificationTier), default=VerificationTier.NONE, nullable=False)
    academic_email = Column(String, nullable=True, unique=True)

class ManualVerificationRequest(Base):
    __tablename__ = "manual_verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_url = Column(String, nullable=False)  # S3 URL of ID Card or Certificate
    status = Column(String, default="pending")  # pending, approved, rejected
    
    user = relationship("User")
