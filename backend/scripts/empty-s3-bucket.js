const { S3Client, ListObjectsV2Command, DeleteObjectsCommand, ListObjectVersionsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: 'eu-central-1' });
const bucketName = 'uniapply-app-dev-webbucket';

async function emptyBucket() {
  try {
    console.log(`Emptying bucket: ${bucketName}`);
    
    // Delete all versions and delete markers
    let isTruncated = true;
    let keyMarker = undefined;
    let versionIdMarker = undefined;
    
    while (isTruncated) {
      const listVersionsParams = { Bucket: bucketName };
      if (keyMarker) listVersionsParams.KeyMarker = keyMarker;
      if (versionIdMarker) listVersionsParams.VersionIdMarker = versionIdMarker;
      
      const listVersionsResponse = await s3Client.send(new ListObjectVersionsCommand(listVersionsParams));
      
      const objectsToDelete = [];
      
      // Add versions
      if (listVersionsResponse.Versions) {
        listVersionsResponse.Versions.forEach(version => {
          objectsToDelete.push({
            Key: version.Key,
            VersionId: version.VersionId
          });
        });
      }
      
      // Add delete markers
      if (listVersionsResponse.DeleteMarkers) {
        listVersionsResponse.DeleteMarkers.forEach(marker => {
          objectsToDelete.push({
            Key: marker.Key,
            VersionId: marker.VersionId
          });
        });
      }
      
      if (objectsToDelete.length > 0) {
        console.log(`Deleting ${objectsToDelete.length} versions/markers...`);
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: false
          }
        };
        
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        console.log('Versions/markers deleted successfully');
      }
      
      isTruncated = listVersionsResponse.IsTruncated;
      keyMarker = listVersionsResponse.NextKeyMarker;
      versionIdMarker = listVersionsResponse.NextVersionIdMarker;
    }
    
    // Also delete any remaining objects (current versions)
    isTruncated = true;
    let continuationToken = undefined;
    
    while (isTruncated) {
      const listParams = { Bucket: bucketName };
      if (continuationToken) {
        listParams.ContinuationToken = continuationToken;
      }
      
      const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));
      
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map(obj => ({ Key: obj.Key })),
            Quiet: false
          }
        };
        
        console.log(`Deleting ${listResponse.Contents.length} current objects...`);
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        console.log('Current objects deleted successfully');
      }
      
      isTruncated = listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
    }
    
    console.log('Bucket emptied successfully');
  } catch (error) {
    console.error('Error emptying bucket:', error);
    throw error;
  }
}

emptyBucket().catch(console.error);
