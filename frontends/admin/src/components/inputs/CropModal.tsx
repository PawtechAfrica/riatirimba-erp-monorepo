import {useCallback, useState} from "react";
import Cropper from "react-easy-crop";
import {Button, Modal} from "@mantine/core";

interface CropModalProps {
    file: File | null;
    onClose: () => void;
    onCrop: (file: File) => void;
}

export default function CropModal({file, onClose, onCrop}: CropModalProps) {
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = async () => {
        if (!file || !croppedAreaPixels) return;

        const image = await createImage(URL.createObjectURL(file));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], file.name, {type: file.type});
                onCrop(croppedFile);
                onClose();
            }
        }, file.type);
    };

    return (
        <Modal opened={!!file} onClose={onClose} size="lg" radius="md">
            <div className="relative w-full h-[400px] bg-black">
                {file && (
                    <Cropper
                        image={URL.createObjectURL(file)}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // square for passport photo
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="default" onClick={onClose}>Cancel</Button>
                <Button onClick={getCroppedImage}>Crop & Save</Button>
            </div>
        </Modal>
    );
}

async function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (err) => reject(err));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });
}
