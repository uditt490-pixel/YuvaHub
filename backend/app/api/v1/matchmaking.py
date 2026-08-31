from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.matchmaking import TeamRequestProfile, TeammateMatch, RequestStatus
from backend.app.core.auth import get_current_user

router = APIRouter()

@router.get("/hackathons/{hackathon_id}/matches")
async def get_teammate_matches(hackathon_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Finds top compatible teammates based on complementary skills and experience alignment."""
    user_profile = db.query(TeamRequestProfile).filter(
        TeamRequestProfile.user_id == current_user.id,
        TeamRequestProfile.hackathon_id == hackathon_id
    ).first()

    if not user_profile:
        raise HTTPException(status_code=404, detail="Please create a team request profile first.")

    # Fetch all other profiles looking for teammates for this specific hackathon
    candidates = db.query(TeamRequestProfile).filter(
        TeamRequestProfile.user_id != current_user.id,
        TeamRequestProfile.hackathon_id == hackathon_id
    ).all()

    scored_matches = []
    user_needed = set(user_profile.skills_needed)
    user_have = set(user_profile.skills_have)

    for candidate in candidates:
        cand_have = set(candidate.skills_have)
        cand_needed = set(candidate.skills_needed)

        # 1. Calculate Score: How much do they provide what we need?
        gives_what_i_need = len(user_needed.intersection(cand_have)) * 3
        # 2. Calculate Score: Do we provide what they need?
        i_give_what_they_need = len(cand_needed.intersection(user_have)) * 2
        # 3. Calculate Score: Experience layer alignment multiplier
        exp_bonus = 1 if candidate.experience_level == user_profile.experience_level else 0

        total_score = gives_what_i_need + i_give_what_they_need + exp_bonus

        scored_matches.append({
            "profile": candidate,
            "score": total_score
        })

    # Sort descending by score match potential and take top recommendations
    scored_matches.sort(key=lambda x: x["score"], reverse=True)
    return scored_matches[:5]
