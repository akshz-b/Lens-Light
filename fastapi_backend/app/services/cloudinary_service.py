import cloudinary
import cloudinary.uploader
from app.core.config import settings

class CloudinaryService:
    @staticmethod
    def initialize():
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )

    @staticmethod
    def upload_image(file_content: bytes, filename: str) -> dict:
        folder = "portfolio_prod" if settings.ENVIRONMENT == "production" else "portfolio_dev"
        result = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            resource_type="image",
            format="webp" # Auto conversion for optimization
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }

    @staticmethod
    def delete_image(public_id: str):
        try:
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Failed to delete {public_id}: {str(e)}")
