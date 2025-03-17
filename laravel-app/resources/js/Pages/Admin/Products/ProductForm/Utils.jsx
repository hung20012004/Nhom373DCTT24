import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = 'product_image';
const CLOUDINARY_CLOUD_NAME = 'deczn9jtq';

export const uploadToCloudinary = async (file) => {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Upload to Cloudinary directly (client-side upload)
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: false,
            }
        );

        return {
            public_id: response.data.public_id,
            url: response.data.secure_url,
            format: response.data.format
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

export const validateImage = (file) => {
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
