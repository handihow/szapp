import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const gcs = require('@google-cloud/storage');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

//creates a resized image when an images is uploaded
export const onFileChange = functions.storage.object().onFinalize((object) => {
  	const fileBucket = object.bucket; // The Storage bucket that contains the file.
	const filePath = object.name; // File path in the bucket.
	const contentType = object.contentType; // File content type.
	const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

	// Exit if this is triggered on a file that is not an image.
	if (!contentType.startsWith('image/')) {
		console.log('This is not an image.');
		return null;
	}

	// Get the file name.
	const fileName = path.basename(filePath);
	// Exit if the image is already a thumbnail.
	if (fileName.startsWith('resized-')) {
		console.log('We already renamed that file!');
		return null;
	}
  	// Download file from bucket.
  	const bucket = gcs.bucket(fileBucket);
  	const tempFilePath = path.join(os.tmpdir(), fileName);
  	const metadata = {
  		contentType: contentType,
  	};
  	return bucket.file(filePath).download({
  		destination: tempFilePath,
  	}).then(() => {
  		console.log('Image downloaded locally to', tempFilePath);
	  // Generate a resized image using ImageMagick.
	  return spawn('convert', [tempFilePath, '-resize', '500x500', tempFilePath]);
	}).then(() => {
		console.log('Resized image created at', tempFilePath);
	  // We add a 'resized-' prefix to resized file name. That's where we'll upload the resized image.
	  const thumbFileName = `resized-${fileName}`;
	  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
	  // Uploading the thumbnail.
	  return bucket.upload(tempFilePath, {
	  	destination: thumbFilePath,
	  	metadata: metadata,
	  });
	  // Once the thumbnail has been uploaded delete the local file to free up disk space.
	}).then(() => fs.unlinkSync(tempFilePath));

});