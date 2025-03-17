import React from 'react';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Trash, ImageIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// SortableImage component for drag and drop functionality
const SortableImage = ({ image, index, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: image.image_id || `new-${index}`,
    });

    const style = {
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition,
    };

    // Determine the image URL to display
    const imageUrl = image.url || image.image_url || '';

    // Determine if this image is the primary one
    const isPrimary = image.is_primary || index === 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative flex items-center bg-white border rounded-md p-2 mb-2 cursor-move ${isPrimary ? 'border-blue-500' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="w-16 h-16 mr-3 bg-gray-100 rounded-md overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-gray-400" />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-medium truncate">{image.file?.name || image.filename || `Ảnh thứ ${index + 1}`}</p>
                <p className="text-xs text-gray-500">
                    Position: {index + 1}
                    {isPrimary && <span className="ml-2 text-blue-500 font-medium">(Primary)</span>}
                </p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemove(index)}
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
};

const ImagesManager = ({ images, setImages, ErrorMessage }) => {
    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Handle image file selection
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(validateImage);

        const newImages = validFiles.map(file => ({
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    // Remove image
    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle image reordering
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex(item => (item.image_id || `new-${items.indexOf(item)}`) === active.id);
                const newIndex = items.findIndex(item => (item.image_id || `new-${items.indexOf(item)}`) === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const validateImage = (file) => {
        // Check file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            alert(`File "${file.name}" quá lớn. Kích thước tối đa là 2MB.`);
            return false;
        }

        // Check file type
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!acceptedTypes.includes(file.type)) {
            alert(`File "${file.name}" không được hỗ trợ. Chỉ chấp nhận JPEG, PNG và WEBP.`);
            return false;
        }

        return true;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Hình ảnh sản phẩm</h3>
            <p className="text-sm text-gray-500">Kéo thả để sắp xếp thứ tự hình ảnh. Hình ảnh đầu tiên sẽ là hình ảnh chính.</p>

            <div className="flex items-center justify-center w-full">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click để tải ảnh lên</span> hoặc kéo thả vào đây
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG hoặc WEBP (MAX. 2MB cho mỗi ảnh)</p>
                    </div>
                    <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </label>
            </div>

            {/* Sortable images list */}
            <div className="mt-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={images.map((img, index) => img.image_id || `new-${index}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        {images.map((image, index) => (
                            <SortableImage
                                key={image.image_id || `new-${index}`}
                                image={image}
                                index={index}
                                onRemove={handleRemoveImage}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
            {ErrorMessage && <ErrorMessage field="images" />}
        </div>
    );
};

export default ImagesManager;
