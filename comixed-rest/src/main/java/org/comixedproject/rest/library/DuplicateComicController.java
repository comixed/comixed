package org.comixedproject.rest.library;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.DuplicateComic;
import org.comixedproject.model.net.library.LoadDuplicateComicsRequest;
import org.comixedproject.model.net.library.LoadDuplicateComicsResponse;
import org.comixedproject.service.library.DuplicateComicService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>DuplicateComicController</code> provides APIs for working with duplicate comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class DuplicateComicController {
  @Autowired private DuplicateComicService duplicateComicService;

  /**
   * Loads duplicate comic books.
   *
   * @param request the request body
   * @return the entries
   */
  @PostMapping(
      value = "/api/library/duplicates",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.duplicate-comic.load")
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.DuplicateComicListView.class)
  public LoadDuplicateComicsResponse loadDuplicateComics(
      @RequestBody() final LoadDuplicateComicsRequest request) {
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Loading duplicate comic book details: {}", request);
    final List<DuplicateComic> comics =
        this.duplicateComicService.loadDuplicateComics(pageSize, pageIndex, sortBy, sortDirection);

    final long filterCount = this.duplicateComicService.getDuplicateComicBookCount();
    return new LoadDuplicateComicsResponse(comics, filterCount);
  }
}
