module.exports = {
  scanFile(file) {
    return { source: 'fileScanner', fileName: file.name || 'unknown' };
  },
};
