import config from '../config';

/**
 * Convert raw S3 keys or URLs into CloudFront URLs so clients can render media consistently.
 */
export const toCloudFrontUrl = (urlOrKey: string): string => {
  if (!urlOrKey) {
    return urlOrKey;
  }

  if (urlOrKey.includes(config.aws.cloudFrontDomain)) {
    return urlOrKey;
  }

  if (urlOrKey.startsWith('products/')) {
    return `https://${config.aws.cloudFrontDomain}/${urlOrKey}`;
  }

  if (urlOrKey.includes('.s3.') || urlOrKey.includes('s3://')) {
    const keyMatch = urlOrKey.match(/products\/[^?]+/);
    if (keyMatch) {
      return `https://${config.aws.cloudFrontDomain}/${keyMatch[0]}`;
    }
  }

  if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
    return urlOrKey;
  }

  return `https://${config.aws.cloudFrontDomain}/${urlOrKey}`;
};

