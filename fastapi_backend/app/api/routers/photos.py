from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.core.security import verify_token
from app.services.cloudinary_service import CloudinaryService

router = APIRouter()

def get_photos_collection():
    db = get_database()
    return db["photos"]

@router.get("/")
async def get_photos(
    category: Optional[str] = "All",
    page: int = 1,
    limit: int = 15,
    collection = Depends(get_photos_collection)
):
    query = {}
    if category and category != "All":
        query["category"] = category

    skip = (page - 1) * limit
    
    cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    photos = []
    async for document in cursor:
        document["id"] = str(document["_id"])
        del document["_id"]
        photos.append(document)
        
    total = await collection.count_documents(query)
    has_more = (skip + len(photos)) < total
    
    return {
        "photos": photos,
        "hasMore": has_more,
        "total": total
    }

@router.post("/")
async def upload_photo(
    photo: UploadFile = File(...),
    caption: str = Form(""),
    category: str = Form("Uncategorized"),
    collection = Depends(get_photos_collection),
    _ = Depends(verify_token)
):
    # Upload to Cloudinary
    file_content = await photo.read()
    cloud_data = CloudinaryService.upload_image(file_content, photo.filename)
    
    # Save to MongoDB
    new_photo = {
        "url": cloud_data["url"],
        "public_id": cloud_data["public_id"],
        "caption": caption,
        "category": category,
        "created_at": datetime.utcnow()
    }
    
    result = await collection.insert_one(new_photo)
    new_photo["id"] = str(result.inserted_id)
    
    return new_photo

@router.delete("/{photo_id}")
async def delete_photo(
    photo_id: str,
    collection = Depends(get_photos_collection),
    _ = Depends(verify_token)
):
    # Find photo
    photo = await collection.find_one({"_id": ObjectId(photo_id)})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
        
    # Delete from Cloudinary
    CloudinaryService.delete_image(photo["public_id"])
    
    # Delete from DB
    await collection.delete_one({"_id": ObjectId(photo_id)})
    return {"success": True}

@router.put("/{photo_id}")
async def update_photo(
    photo_id: str,
    caption: str = Form(...),
    category: str = Form(...),
    collection = Depends(get_photos_collection),
    _ = Depends(verify_token)
):
    result = await collection.update_one(
        {"_id": ObjectId(photo_id)},
        {"$set": {"caption": caption, "category": category}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found or no changes made")
        
    return {"success": True}
