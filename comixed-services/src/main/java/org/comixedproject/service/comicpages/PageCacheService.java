/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.comicpages;

import java.io.*;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.IOUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>PageCacheService</code> provides methods for working with the page cache.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class PageCacheService {
  @Autowired private ComicPageService comicPageService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicFileService comicFileService;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;

  @Value("${comixed.images.cache.location}")
  String cacheDirectory;

  /**
   * Returns a cache entry by page hash.
   *
   * @param hash the page hash
   * @return the content, of <code>null</code> if not found
   */
  public byte[] findByHash(final String hash) {
    log.debug("Searching for cached image: hash={}", hash);

    final File file = this.getFileForHash(hash);
    byte[] result = null;
    if (file != null && file.exists() && !file.isDirectory()) {
      log.debug("Loading cached image content: {} bytes", file.length());

      try (FileInputStream input = new FileInputStream(file)) {
        result = IOUtils.readFully(input, (int) file.length());
      } catch (Exception error) {
        log.error("Failed to load cached image", error);
      }

      return result;
    }

    log.debug("No image in cache");
    return null;
  }

  File getFileForHash(final String hash) {
    if (Objects.isNull(hash) || hash.length() != 32) {
      return null;
    }

    final String path =
        this.cacheDirectory
            + File.separator
            + hash.substring(0, 8)
            + File.separator
            + hash.substring(8, 16)
            + File.separator
            + hash.substring(16, 24)
            + File.separator
            + hash.substring(24, 32);
    return new File(path);
  }

  /**
   * Saves the content for a page by its hash in the cache.
   *
   * @param hash the page hash
   * @param content the page content
   */
  public void saveByHash(String hash, final byte[] content) {
    if (!StringUtils.hasLength(hash)) {
      hash = this.genericUtilitiesAdaptor.createHash(content);
    }
    try {
      log.debug("Saving image to cache: hash={}", hash);
      final File file = this.getFileForHash(hash);
      file.getParentFile().mkdirs();
      IOUtils.write(content, new FileOutputStream(file, false));
    } catch (IOException error) {
      log.error("Failed to add page to image cache", error);
    }
  }

  /**
   * Returns the root directory for the image cache.
   *
   * @return the root directory
   */
  public String getRootDirectory() {
    log.debug("Getting the image cache root directory: {}", this.cacheDirectory);
    return this.cacheDirectory;
  }

  /**
   * Adds page content to the image cache.
   *
   * @param page the page
   */
  public void addPageToCache(final ComicPage page) {
    log.debug("Adding page to cache: id={}", page.getComicPageId());
    try {
      this.saveByHash(
          page.getHash(),
          this.comicBookAdaptor.loadPageContent(page.getComicBook(), page.getPageNumber()));
    } catch (AdaptorException error) {
      log.error("Failed to add page to image cache", error);
    }
  }

  /** Prepares pages that do not have cache entries. */
  @Transactional
  public void prepareCoverPagesWithoutCacheEntries() {
    log.debug("Processing pages without image cache entries");
    this.comicPageService
        .findAllCoverPageHashes()
        .forEach(
            hash -> {
              final File file = this.getFileForHash(hash);
              if (Objects.nonNull(file) && !file.exists()) {
                log.trace("Marking page to have image cache entry created: {}", hash);
                this.comicPageService.markCoverPagesToHaveCacheEntryCreated(hash);
              }
            });
  }

  public ResponseEntity<byte[]> getCoverPageContent(
      final long comicBookId, final String missingFilename) throws ComicPageException {
    final Long pageId = this.comicPageService.getPageIdForComicBookCover(comicBookId);
    if (pageId != null) {
      log.debug("Loading cover content by page id: id={}", pageId);
      return this.getPageContent(pageId, missingFilename);
    }

    log.debug("Loading cover content from comic archive");
    final ComicBook comicBook;
    try {
      comicBook = this.comicBookService.getComic(comicBookId);
      final byte[] content =
          this.comicFileService.getImportFileCover(comicBook.getComicDetail().getFilename());
      if (content != null) {
        return this.doProcessContent(content, "cover", missingFilename);
      }

      log.debug("Loading missing page for cover content: {}", missingFilename);
      return this.doProcessContent(null, "", missingFilename);
    } catch (ComicBookException | AdaptorException error) {
      log.error("Failed to load comic cover content", error);
      return this.doProcessContent(null, "", missingFilename);
    }
  }

  /**
   * Returns the content for a page, by record id, prepared for web display. If the content is not
   * found then loads the alternate file and returns that instead.
   *
   * @param pageId the page id
   * @param missingFilename the alternate content file
   * @return the page content
   * @throws ComicPageException if the page is not found
   * @see #saveByHash(String, byte[])
   */
  public ResponseEntity<byte[]> getPageContent(final long pageId, final String missingFilename)
      throws ComicPageException {
    final String comicFilename = this.comicPageService.getComicFilenameForPage(pageId);
    final String pageFilename = this.comicPageService.getPageFilename(pageId);
    final String pageHash = this.comicPageService.getHashForPage(pageId);

    return this.doGetPageContent(comicFilename, pageFilename, pageHash, missingFilename);
  }

  /**
   * Returns the content for a page, by file hash, prepared for web display. If the content is not
   * found then loads the alternate file and returns that instead.
   *
   * @param hash the page hash
   * @param missingFilename the alternate content file
   * @return the page content
   * @throws ComicPageException if the page was not found
   * @see #getPageContent(long, String)
   */
  public ResponseEntity<byte[]> getPageContent(final String hash, final String missingFilename)
      throws ComicPageException {
    final ComicPage page = this.comicPageService.getOneForHash(hash);
    if (page == null) throw new ComicPageException("No pages with hash: " + hash);
    return this.doGetPageContent(page, missingFilename);
  }

  private ResponseEntity<byte[]> doGetPageContent(ComicPage page, final String missingFilename)
      throws ComicPageException {
    log.debug("creating response entity for page: id={}", page.getComicPageId());
    byte[] content = this.findByHash(page.getHash());

    if (content == null) {
      try {
        log.debug("Fetching content for page");
        content = this.comicBookAdaptor.loadPageContent(page.getComicBook(), page.getPageNumber());
        if (!Objects.isNull(content) && Objects.isNull(page.getHash())) {
          log.debug("Updating page content: id={}", page.getComicPageId());
          page = this.comicPageService.updatePageContent(page, content);
          log.debug("Caching image for hash: {} bytes hash={}", content.length, page.getHash());
          this.saveByHash(page.getHash(), content);
        }
      } catch (AdaptorException error) {
        throw new ComicPageException("Failed to load page content", error);
      }
    }

    return this.doProcessContent(content, page.getFilename(), missingFilename);
  }

  private ResponseEntity<byte[]> doGetPageContent(
      final String comicFilename,
      final String pageFilename,
      final String pageHash,
      final String missingFilename)
      throws ComicPageException {
    log.debug("Creating response entity for page");
    byte[] content = this.findByHash(pageHash);

    if (content == null) {
      try {
        log.debug("Fetching content for page");
        content = this.comicBookAdaptor.loadPageContent(comicFilename, pageFilename);
        if (!Objects.isNull(content) && !Objects.isNull(pageHash)) {
          log.debug("Caching image for hash: {} bytes hash={}", content.length, pageHash);
          this.saveByHash(pageHash, content);
        }
      } catch (AdaptorException error) {
        throw new ComicPageException("Failed to load page content", error);
      }
    }

    return this.doProcessContent(content, pageFilename, missingFilename);
  }

  private ResponseEntity<byte[]> doProcessContent(
      byte[] content, final String pageFilename, final String missingFilename)
      throws ComicPageException {
    if (content == null) {
      content = this.doLoadMissingPageImage(missingFilename);
    }

    String type =
        this.fileTypeAdaptor.getType(new ByteArrayInputStream(content))
            + "/"
            + this.fileTypeAdaptor.getSubtype(new ByteArrayInputStream(content));
    log.debug("ComicPage type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content != null ? content.length : 0)
        .header("Content-Disposition", "attachment; filename=\"" + pageFilename + "\"")
        .contentType(MediaType.valueOf(type))
        .cacheControl(CacheControl.maxAge(24, TimeUnit.DAYS))
        .body(content);
  }

  private byte[] doLoadMissingPageImage(final String missingFilename) throws ComicPageException {
    try (final InputStream input = this.getClass().getResourceAsStream(missingFilename)) {
      return input.readAllBytes();
    } catch (Exception error) {
      log.error("Failed to load missing page image", error);
      throw new ComicPageException("Cannot find image: " + missingFilename, error);
    }
  }
}
