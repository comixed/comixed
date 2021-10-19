package org.comixedproject.adaptors.archive.model;

import org.apache.commons.compress.archivers.zip.ZipFile;

/**
 * <code>CbzArchiveReadHandle</code> provides a read handle for working with ZIP archives.
 *
 * @author Darryl L. Pierce
 */
public class CbzArchiveReadHandle extends AbstractArchiveReadHandle<ZipFile> {
  public CbzArchiveReadHandle(final ZipFile archiveHandle, final String filename) {
    super(archiveHandle, filename);
  }
}
