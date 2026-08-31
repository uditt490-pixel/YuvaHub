from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.verification import VerificationTier, ManualVerificationRequest
from backend.app.core.auth import get_current_user, get_current_admin

router = APIRouter()

ACADEMIC_DOMAINS = (".edu", ".ac.in")

@router.post("/verify-academic-email")
async def verify_academic_email(email: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Automatically verify students with matching academic suffixes."""
    if not email.endswith(ACADEMIC_DOMAINS):
        raise HTTPException(status_code=400, detail="Provided email is not a valid academic domain.")
    
    current_user.academic_email = email
    current_user.is_verified = True
    current_user.verification_tier = VerificationTier.STUDENT
    db.commit()
    return {"message": "Student verification successful.", "tier": VerificationTier.STUDENT}

@router.post("/submit-manual-verification")
async def submit_manual_verification(document_url: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Allow startups/edge cases to submit incorporation documents for manual review."""
    request = ManualVerificationRequest(user_id=current_user.id, document_url=document_url, status="pending")
    current_user.verification_tier = VerificationTier.MANUAL_PENDING
    db.add(request)
    db.commit()
    return {"message": "Verification request submitted successfully."}

@router.patch("/admin/review-request/{request_id}")
async def review_verification_request(request_id: int, approve: bool, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin endpoint to approve or reject pending requests from the queue."""
    req = db.query(ManualVerificationRequest).filter(ManualVerificationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    
    if approve:
        req.status = "approved"
        req.user.is_verified = True
        req.user.verification_tier = VerificationTier.MANUAL_APPROVED
    else:
        req.status = "rejected"
        req.user.is_verified = False
        req.user.verification_tier = VerificationTier.NONE
        
    db.commit()
    return {"message": f"Request status updated to {req.status}."}
