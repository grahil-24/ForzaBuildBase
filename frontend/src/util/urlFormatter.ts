import { S3_BUCKET_URL } from "../config/env";

const formatS3BucketURL = ({manufacturer, image_filename}: {manufacturer: string, image_filename: string}) => {
    const manufacturerImg = image_filename ? manufacturer.replace(/ /g, '_') : 'Default';
    const imageFileName = image_filename ? image_filename.replace(/ /g, '_') : 'default_car.png';
    return `${S3_BUCKET_URL}/${manufacturerImg}/${imageFileName}`;
}

export {formatS3BucketURL};