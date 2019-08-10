import * as functions from 'firebase-functions'

import { basename, join, dirname } from 'path'
import * as Storage from '@google-cloud/storage'
import * as sharp from 'sharp'

const gcs = new Storage.Storage();
const THUMB_PREFIX = "thumb_";

function validateImage(object:any):boolean {
    
    const filePath = object.name
    const contentType = object.contentType
    if (!filePath || !contentType) {
        console.log('No filepath or content type.')
        return false
    }
    if (!filePath.includes('postimages')) {
        console.log('Skipping file as it is not an image: ', filePath)
        return false;
    }
    const fileName = basename(filePath)
    if (!contentType.startsWith('image/')) {
        console.log('Not an image: ', contentType)
        return false;
    }
    if (fileName.includes(THUMB_PREFIX)) {
        console.log('Already a thumbnail', fileName)
        return false;
    }
    return true
}

exports = module.exports = functions.storage.object().onFinalize(async (object) => {
    if (!validateImage(object)) {
        return false
    }
    const filePath = object.name ? object.name : ""
    const contentType = object.contentType
    const fileName = basename(filePath)
    const resizes = [
        {size:200, fit: sharp.fit.cover},
        {size:1600, fit:sharp.fit.inside}
    ]
    const metadata = { contentType: contentType };
    const promises:Promise<void>[] = []

    for (const resize of resizes) {
        // We add a 'thumb_' prefix to thumbnails file name.
        const thumbFileName = `${THUMB_PREFIX}${resize.size}_${fileName}`
        const thumbFilePath = join(dirname(filePath), thumbFileName)
        console.log('Creating thumbnail: ', thumbFileName)

        // Create write stream for uploading thumbnail
        const bucket = gcs.bucket(object.bucket)
        const thumbnailUploadStream = bucket.file(thumbFilePath).createWriteStream({ metadata })

        // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
        const pipeline = sharp()
        pipeline.resize(resize.size, resize.size, {fit: resize.fit}).pipe(thumbnailUploadStream)
        bucket.file(filePath).createReadStream().pipe(pipeline).on('end', () => {
            console.log('Created thumbnail: ', thumbFileName)
        })
        promises.push(
            new Promise((resolve, reject) =>
                thumbnailUploadStream.on('finish', resolve).on('error', reject)))
    }

    return Promise.all(promises)
})
