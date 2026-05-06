from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="owner")
    logs = relationship("Log", back_populates="user")
    favorites = relationship("FormulaEntry", secondary="user_favorites", back_populates="favorited_by")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username!r})>"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer)          # bytes
    page_count = Column(Integer, default=0)
    version = Column(Integer, default=1)
    status = Column(String(50), default="uploaded")  # uploaded | processing | done | error
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    formulas = relationship("FormulaEntry", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title!r}, status={self.status!r})>"


class FormulaEntry(Base):
    __tablename__ = "formula_entries"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    latex_raw = Column(Text, nullable=False)          # original OCR result
    latex_edited = Column(Text, nullable=True)        # user-edited version
    confidence = Column(Float, nullable=True)         # OCR confidence score (0-1)
    bbox_x = Column(Float, nullable=True)             # bounding box in PDF (normalized)
    bbox_y = Column(Float, nullable=True)
    bbox_w = Column(Float, nullable=True)
    bbox_h = Column(Float, nullable=True)
    image_path = Column(String(512), nullable=True)   # path to cropped formula image
    order_index = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    document = relationship("Document", back_populates="formulas")
    favorited_by = relationship("User", secondary="user_favorites", back_populates="favorites")

    def __repr__(self):
        return f"<FormulaEntry(id={self.id}, doc={self.document_id}, page={self.page_number})>"


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)   # e.g. "upload", "process", "save"
    detail = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")

    def __repr__(self):
        return f"<Log(id={self.id}, action={self.action!r})>"


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    formula_id = Column(Integer, ForeignKey("formula_entries.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
