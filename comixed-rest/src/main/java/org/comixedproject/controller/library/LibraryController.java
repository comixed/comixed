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

package org.comixedproject.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.net.ClearImageCacheResponse;
import org.comixedproject.model.net.ConsolidateLibraryRequest;
import org.comixedproject.model.net.ConvertComicsRequest;
import org.comixedproject.model.net.library.LoadLibraryRequest;
import org.comixedproject.model.net.library.LoadLibraryResponse;
import org.comixedproject.model.net.library.MoveComicsRequest;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.library.LibraryService;
import org.comixedproject.task.ConvertComicsTask;
import org.comixedproject.task.MoveComicsTask;
import org.comixedproject.task.runner.TaskManager;
import org.comixedproject.views.View;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api")
@Log4j2
public class LibraryController {
  static final int MAXIMUM_RECORDS = 100;

  @Autowired private LibraryService libraryService;
  @Autowired private ComicService comicService;
  @Autowired private TaskManager taskManager;
  @Autowired private ObjectFactory<ConvertComicsTask> convertComicsWorkerTaskObjectFactory;
  @Autowired private ObjectFactory<MoveComicsTask> moveComicsWorkerTaskObjectFactory;

  @PostMapping(value = "/library/convert", consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public void convertComics(@RequestBody() ConvertComicsRequest request) {
    List<Long> idList = request.getComicIdList();
    ArchiveType archiveType = request.getArchiveType();
    boolean renamePages = request.isRenamePages();
    boolean deletePages = request.isDeletePages();
    boolean deleteOriginal = request.isDeleteOriginal();

    log.info(
        "Converting {} comic{} to {}{}{}{}",
        idList.size(),
        idList.size() == 1 ? "" : "s",
        archiveType,
        renamePages ? " (rename pages)" : "",
        deletePages ? " (delete pages)" : "",
        deleteOriginal ? " (delete original comic)" : "");

    final ConvertComicsTask task = this.convertComicsWorkerTaskObjectFactory.getObject();
    task.setIdList(idList);
    task.setTargetArchiveType(archiveType);
    task.setRenamePages(renamePages);
    task.setDeletePages(deletePages);
    task.setDeleteOriginal(deleteOriginal);

    this.taskManager.runTask(task);
  }

  @PostMapping(
      value = "/library/consolidate",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DeletedComicList.class)
  @AuditableEndpoint
  public List<Comic> consolidateLibrary(@RequestBody() ConsolidateLibraryRequest request) {
    log.info("Consolidating library: delete physic files={}", request.getDeletePhysicalFiles());
    return this.libraryService.consolidateLibrary(request.getDeletePhysicalFiles());
  }

  @DeleteMapping(value = "/library/cache/images")
  @AuditableEndpoint
  public ClearImageCacheResponse clearImageCache() {
    log.info("Clearing the image cache");

    try {
      this.libraryService.clearImageCache();
    } catch (LibraryException error) {
      log.error("failed to clear image cache", error);
      return new ClearImageCacheResponse(false);
    }

    return new ClearImageCacheResponse(true);
  }

  /**
   * Consolidates the library, moving all comics under the specified parent directory and using
   * given naming rules. Will delete comics marked for deletion as well.
   *
   * @param request the request body
   */
  @PostMapping(
      value = "/library/move",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint
  public void moveComics(@RequestBody() MoveComicsRequest request) {
    String targetDirectory = request.getTargetDirectory();
    String renamingRule = request.getRenamingRule();

    log.info("Moving comics: targetDirectory={}", targetDirectory);
    log.info("             : renamingRule={}", renamingRule);

    final MoveComicsTask task = this.moveComicsWorkerTaskObjectFactory.getObject();
    task.setDirectory(targetDirectory);
    task.setRenamingRule(renamingRule);

    this.taskManager.runTask(task);
  }

  /**
   * Loads a batch of comics during the initial startup process.
   *
   * @param request the request
   * @return the response
   */
  @PostMapping(
      value = "/library",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @AuditableEndpoint
  @JsonView(View.ComicListView.class)
  public LoadLibraryResponse loadLibrary(@RequestBody() final LoadLibraryRequest request) {
    final Long lastId = request.getLastId();
    log.info("Loading library for {}: last id was {}", lastId);

    List<Comic> comics = this.comicService.getComicsById(lastId, MAXIMUM_RECORDS + 1);
    boolean lastPayload = true;
    if (comics.size() > MAXIMUM_RECORDS) {
      comics = comics.subList(0, MAXIMUM_RECORDS);
      lastPayload = false;
    }

    return new LoadLibraryResponse(
        comics, comics.isEmpty() ? 0 : comics.get(comics.size() - 1).getId(), lastPayload);
  }
}
