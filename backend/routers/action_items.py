from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ActionItem
from schemas import ActionItemUpdate, ActionItemOut

router = APIRouter(prefix="/api/action-items", tags=["action-items"])


@router.put("/{item_id}", response_model=ActionItemOut)
def update_action_item(item_id: str, body: ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    if body.text is not None:
        item.text = body.text
    if body.assignee is not None:
        item.assignee = body.assignee
    if body.due_date is not None:
        item.due_date = body.due_date
    if body.completed is not None:
        item.completed = body.completed

    db.commit()
    db.refresh(item)
    return ActionItemOut.model_validate(item)


@router.delete("/{item_id}", status_code=204)
def delete_action_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(item)
    db.commit()
