const resolutionOptions = [
  { label: '320x240 (QVGA)', value: '320x240' },
  { label: '240x320 (QVGA Vertical)', value: '240x320' },
  { label: '640x480 (VGA)', value: '640x480' },
  { label: '480x640 (VGA Vertical)', value: '480x640' },
  { label: '800x600 (SVGA)', value: '800x600' },
  { label: '600x800 (SVGA Vertical)', value: '600x800' },
  { label: '1024x768 (XGA)', value: '1024x768' },
  { label: '768x1024 (XGA Vertical)', value: '768x1024' },
  { label: '1280x720 (HD)', value: '1280x720' },
  { label: '720x1280 (HD Vertical)', value: '720x1280' },
  { label: '1280x800 (WXGA)', value: '1280x800' },
  { label: '800x1280 (WXGA Vertical)', value: '800x1280' },
  { label: '2560x1440 (QHD)', value: '2560x1440' },
  { label: '1440x2560 (QHD Vertical)', value: '1440x2560' },
  { label: '2960x1440 (WQHD)', value: '2960x1440' },
  { label: '1440x2960 (WQHD Vertical)', value: '1440x2960' },
  { label: '2048x1536 (QXGA)', value: '2048x1536' },
  { label: '1536x2048 (QXGA Vertical)', value: '1536x2048' },
  { label: '2560x1600 (WQXGA)', value: '2560x1600' },
  { label: '1600x2560 (WQXGA Vertical)', value: '1600x2560' },
  { label: '1920x1080 (Full HD)', value: '1920x1080' },
  { label: '1080x1920 (Full HD Vertical)', value: '1080x1920' },
  { label: '2048x1080 (2K)', value: '2048x1080' },
  { label: '1080x2048 (2K Vertical)', value: '1080x2048' },
  { label: '3840x2160 (4K UHD)', value: '3840x2160' },
  { label: '2160x3840 (4K UHD Vertical)', value: '2160x3840' },
  { label: '4096x2160 (4K DCI)', value: '4096x2160' },
  { label: '2160x4096 (4K DCI Vertical)', value: '2160x4096' },
];

const DEFAULT_RESOLUTION = { width: 854, height: 480 };

export default resolutionOptions;
export { resolutionOptions, DEFAULT_RESOLUTION };
