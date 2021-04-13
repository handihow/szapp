"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onFileChange = void 0;
const functions = require("firebase-functions");
const { Storage } = require('@google-cloud/storage');
// Creates a client
const gcs = new Storage({
    projectId: process.env.GCP_PROJECT
});
const os_1 = require("os");
const path_1 = require("path");
const sharp = require("sharp");
const fs = require("fs-extra");
//creates a resized image when an images is uploaded
exports.onFileChange = functions.storage.object().onFinalize((object) => __awaiter(void 0, void 0, void 0, function* () {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name || ''; // File path in the bucket.
    const contentType = object.contentType || '';
    const metaData = object.metadata;
    const fileName = filePath.split('/').pop() || '';
    const bucketDir = path_1.dirname(filePath);
    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('resized-')) {
        console.log('We already renamed that file!');
        return null;
    }
    const workingDir = path_1.join(os_1.tmpdir(), 'thumbs');
    const tmpFilePath = path_1.join(workingDir, fileName);
    // ensure thumbnair dir exists
    yield fs.ensureDir(workingDir);
    // download source file
    yield bucket.file(filePath).download({
        destination: tmpFilePath
    });
    // resize images and define array of upload promises
    const sizes = [512];
    const filePaths = [];
    const uploadPromises = sizes.map((size) => __awaiter(void 0, void 0, void 0, function* () {
        const thumbName = `resized-${fileName}`;
        const thumbPath = path_1.join(workingDir, thumbName);
        filePaths.push(path_1.join(bucketDir, thumbName));
        // resize source image
        yield sharp(tmpFilePath, { failOnError: false })
            .rotate()
            .resize(size, size)
            .toFile(thumbPath);
        // upload to GCS
        return bucket.upload(thumbPath, {
            destination: path_1.join(bucketDir, thumbName), metadata: metaData
        });
    }));
    // run the upload operations
    yield Promise.all(uploadPromises);
    // cleanup remove the tmp/thumbs from the filesystem
    return fs.remove(workingDir);
}));
//# sourceMappingURL=index.js.map