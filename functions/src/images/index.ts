import * as functions from 'firebase-functions';

const {Storage} = require('@google-cloud/storage');
// Creates a client
const gcs = new Storage({
	projectId: process.env.GCP_PROJECT
});


import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';
import * as fs from 'fs-extra';

//creates a resized image when an images is uploaded
export const onFileChange = functions.storage.object().onFinalize(async object => {
  	const bucket = gcs.bucket(object.bucket);
	const filePath = object.name || ''; // File path in the bucket.
	const contentType = object.contentType || '';
	const metaData = object.metadata;
 	const fileName = filePath.split('/').pop() || '';
 	const bucketDir = dirname(filePath);

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


	const workingDir = join(tmpdir(), 'thumbs');
	const tmpFilePath = join(workingDir, fileName);
	// ensure thumbnair dir exists
	await fs.ensureDir(workingDir);

	// download source file
	await bucket.file(filePath).download({
		destination: tmpFilePath
	});


	// resize images and define array of upload promises
	const sizes = [512];

	const filePaths: string[] = [];
	const uploadPromises = sizes.map(async size => {
		const thumbName = `resized-${fileName}`;
		const thumbPath = join(workingDir, thumbName);
		filePaths.push(join(bucketDir, thumbName));

		// resize source image
		await sharp(tmpFilePath, {failOnError: false})
			.rotate()
			.resize(size, size)
			.toFile(thumbPath);

		// upload to GCS
		return bucket.upload(thumbPath, {
			destination: join(bucketDir, thumbName), metadata: metaData
		});
	});

	// run the upload operations
	await Promise.all(uploadPromises);
	// cleanup remove the tmp/thumbs from the filesystem
	return fs.remove(workingDir);


});