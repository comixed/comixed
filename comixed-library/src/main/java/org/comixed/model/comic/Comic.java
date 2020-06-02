/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.model.comic;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.io.File;
import java.text.DateFormat;
import java.util.*;
import javax.persistence.*;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixed.adaptors.ArchiveType;
import org.comixed.adaptors.archive.ArchiveAdaptor;
import org.comixed.model.library.ReadingList;
import org.comixed.model.tasks.Task;
import org.comixed.model.user.LastReadDate;
import org.comixed.views.View;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>Comic</code> represents a single digital comic issue.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Entity
@Table(name = "comics")
@Log4j2
public class Comic {
  @Enumerated(EnumType.STRING)
  @JsonProperty("archiveType")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  ArchiveType archiveType;

  @Transient @JsonIgnore File backingFile;

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "comic_story_arcs", joinColumns = @JoinColumn(name = "comic_id"))
  @Column(name = "story_name")
  @JsonProperty("storyArcs")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  List<String> storyArcs = new ArrayList<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderColumn(name = "page_number")
  @JsonProperty("pages")
  @JsonView({
    View.ComicDetails.class,
  })
  List<Page> pages = new ArrayList<>();

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({
    View.ComicList.class,
    View.DeletedComicList.class,
    View.PageList.class,
    View.DuplicatePageList.class,
    View.DatabaseBackup.class,
    View.ReadingList.class
  })
  private Long id;

  @ManyToOne
  @JoinColumn(name = "scan_type_id")
  @JsonProperty("scanType")
  @JsonView({View.ComicList.class, View.PageList.class, View.DatabaseBackup.class})
  private ScanType scanType;

  @ManyToOne
  @JoinColumn(name = "format_id")
  @JsonProperty("format")
  @JsonView({View.ComicList.class, View.PageList.class, View.DatabaseBackup.class})
  private ComicFormat format;

  @Column(name = "filename", nullable = false, unique = true, length = 1024)
  @JsonProperty("filename")
  @JsonView({View.ComicList.class, View.PageList.class, View.DatabaseBackup.class})
  private String filename;

  @OneToOne(cascade = CascadeType.ALL, mappedBy = "comic", orphanRemoval = true)
  @JsonView({View.ComicList.class, View.ComicDetails.class})
  private ComicFileDetails fileDetails;

  @Formula(value = "(SELECT COUNT(*) FROM pages p WHERE p.comic_id = id)")
  @JsonIgnore
  @Transient
  private Integer calculatedPageCount;

  @Formula(value = "(SELECT COUNT(*) FROM pages p where p.comic_id = id AND p.deleted = true)")
  @JsonIgnore
  private Integer calculatedDeletedPageCount;

  @Column(name = "added_date", updatable = false, nullable = false)
  @JsonProperty("addedDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  @Temporal(TemporalType.TIMESTAMP)
  private Date dateAdded = new Date();

  @Column(name = "deleted_date", updatable = true, nullable = true)
  @JsonProperty("deletedDate")
  @JsonFormat(shape = Shape.NUMBER)
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  @Temporal(TemporalType.TIMESTAMP)
  private Date dateDeleted;

  @Column(name = "last_updated_date", updatable = true, nullable = false)
  @JsonProperty("lastUpdatedDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  @Temporal(TemporalType.TIMESTAMP)
  private Date dateLastUpdated = new Date();

  @Column(name = "publisher", length = 128)
  @JsonProperty("publisher")
  @JsonView({View.ComicList.class, View.DuplicatePageList.class, View.DatabaseBackup.class})
  private String publisher;

  @Column(name = "series", length = 128)
  @JsonProperty("series")
  @JsonView({
    View.ComicList.class,
    View.PageList.class,
    View.DuplicatePageList.class,
    View.DatabaseBackup.class
  })
  private String series;

  @Column(name = "volume", length = 4)
  @JsonProperty("volume")
  @JsonView({
    View.ComicList.class,
    View.PageList.class,
    View.DuplicatePageList.class,
    View.DatabaseBackup.class
  })
  private String volume;

  @Column(name = "issue_number", length = 16)
  @JsonProperty("issueNumber")
  @JsonView({
    View.ComicList.class,
    View.PageList.class,
    View.DuplicatePageList.class,
    View.DatabaseBackup.class
  })
  private String issueNumber;

  @Column(name = "imprint")
  @JsonProperty("imprint")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private String imprint;

  @Column(name = "comic_vine_id", length = 16)
  @JsonProperty("comicVineId")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private String comicVineId;

  @Column(name = "cover_date", nullable = true)
  @Temporal(TemporalType.DATE)
  @JsonProperty("coverDate")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private Date coverDate;

  @Column(name = "title", length = 128)
  @JsonProperty("title")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private String title;

  @Column(name = "sort_name", length = 128)
  @JsonProperty("sortName")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private String sortName;

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "comic_characters", joinColumns = @JoinColumn(name = "comic_id"))
  @Column(name = "character_name")
  @JsonProperty("characters")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private List<String> characters = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "comic_teams", joinColumns = @JoinColumn(name = "comic_id"))
  @Column(name = "team_name")
  @JsonProperty("teams")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private List<String> teams = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "comic_locations", joinColumns = @JoinColumn(name = "comic_id"))
  @Column(name = "location_name")
  @JsonProperty("locations")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private List<String> locations = new ArrayList<>();

  @OneToMany(
      mappedBy = "comic",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  @JsonProperty("credits")
  @JsonView({View.ComicList.class, View.DatabaseBackup.class})
  private Set<Credit> credits = new HashSet<>();

  @Transient
  @JsonProperty("nextIssueId")
  @JsonView({View.ComicDetails.class})
  private Long nextIssueId;

  @Transient
  @JsonProperty("previousIssueId")
  @JsonView({View.ComicDetails.class})
  private Long previousIssueId;

  @Formula(
      value =
          "(SELECT COUNT(*) FROM pages p WHERE p.comic_id = id AND p.hash in (SELECT d.hash FROM blocked_page_hashes d))")
  @JsonProperty("blockedPageCount")
  @JsonView(View.ComicList.class)
  private int blockedPageCount;

  @Transient
  @JsonProperty("comicVineURL")
  @JsonView({View.ComicDetails.class, View.DatabaseBackup.class})
  private String comicVineURL;

  @Column(name = "description")
  @Lob
  @JsonProperty("description")
  @JsonView({View.ComicDetails.class, View.DatabaseBackup.class})
  private String description;

  @Column(name = "notes")
  @Lob
  @JsonProperty("notes")
  @JsonView({View.ComicDetails.class, View.DatabaseBackup.class})
  private String notes;

  @Column(name = "summary")
  @Lob
  @JsonProperty("summary")
  @JsonView({View.ComicDetails.class, View.DatabaseBackup.class})
  private String summary;

  @Formula(
      "(SELECT COUNT(*) FROM comics c WHERE c.series = series AND c.volume = volume AND c.issue_number = issue_number)")
  @JsonProperty("duplicateCount")
  @JsonView(View.ComicList.class)
  private Integer duplicateCount;

  @ManyToMany(mappedBy = "comics", cascade = CascadeType.ALL)
  @JsonProperty("readingLists")
  @JsonView(View.ComicList.class)
  private Set<ReadingList> readingLists = new HashSet<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<Task> tasks = new ArrayList<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<LastReadDate> lastReadDates = new ArrayList<>();

  public Date getDateLastUpdated() {
    return dateLastUpdated;
  }

  public void setDateLastUpdated(final Date dateLastUpdated) {
    this.dateLastUpdated = dateLastUpdated;
  }

  /**
   * Adds a character to the comic.
   *
   * @param character the character
   */
  public void addCharacter(String character) {
    this.log.debug("Adding character=" + character);
    if (this.characters.contains(character)) {
      this.log.debug("Duplicate character");
      return;
    }
    this.characters.add(character);
  }

  public void addCredit(String name, String role) {
    this.log.debug("Adding a credit: name={} role={}", name, role);
    Credit credit = new Credit(name, role);

    credit.setComic(this);
    this.credits.add(credit);
  }

  /**
   * Adds a new location reference to the comic.
   *
   * @param location the location
   */
  public void addLocation(String location) {
    this.log.debug("Adding location=" + location);
    if (this.locations.contains(location)) {
      this.log.debug("Duplication location");
      return;
    }
    this.locations.add(location);
  }

  /**
   * Adds a new offset to the comic.
   *
   * @param index the index
   * @param offset the offset
   */
  public void addPage(int index, Page page) {
    this.log.debug("Adding offset: index=" + index + " hash=" + page.getHash());
    page.setComic(this);
    page.setPageNumber(index);
    this.pages.add(index, page);
  }

  /**
   * Adds a story arc to the comic.
   *
   * @param series the story arc series
   */
  public void addStoryArc(String name) {
    this.log.debug("Adding story arc=" + name);
    if (this.storyArcs.contains(name)) {
      this.log.debug("Duplicate story arc");
      return;
    }
    this.storyArcs.add(name);
  }

  /**
   * Adds the given team to the comic.
   *
   * @param team the team
   */
  public void addTeam(String team) {
    this.log.debug("Adding team=" + team);
    if (this.teams.contains(team)) {
      this.log.debug("Duplicate team");
      return;
    }
    this.teams.add(team);
  }

  /** Removes all character references. */
  public void clearCharacters() {
    this.characters.clear();
  }

  /** Removes all associated credits. */
  public void clearCredits() {
    this.log.debug("Clearing credits");
    this.credits.clear();
  }

  /** Removes all location references from the comic. */
  public void clearLocations() {
    this.log.debug("Clearing location references");
    this.locations.clear();
  }

  /** Clears out all story arc references. */
  public void clearStoryArcs() {
    this.log.debug("Clearing story arcs");
    this.storyArcs.clear();
  }

  /** Removes all team references from the comic. */
  public void clearTeams() {
    this.log.debug("Clearing out teams");
    this.teams.clear();
  }

  /**
   * Deletes a offset from the comic.
   *
   * @param index the offset index
   */
  public void deletePage(int index) {
    this.log.debug("Deleting offset: index=" + index);
    this.pages.remove(index);
  }

  public ArchiveType getArchiveType() {
    return this.archiveType;
  }

  public void setArchiveType(ArchiveType archiveType) {
    this.archiveType = archiveType;
  }

  @Transient
  public ArchiveAdaptor getArchiveAdaptor() {
    return this.archiveType.getArchiveAdaptor();
  }

  /**
   * Returns just the filename without the path.
   *
   * @return the filename
   */
  @JsonProperty("baseFilename")
  @JsonView(View.ComicList.class)
  public String getBaseFilename() {
    return FilenameUtils.getName(this.filename);
  }

  /**
   * Returns the number of blocked pages for the comic.
   *
   * @return the blocked offset count
   */
  public int getBlockedPageCount() {
    return this.blockedPageCount;
  }

  /**
   * Returns the character reference at the given index.
   *
   * @param index the index
   * @return the character reference
   */
  public String getCharacter(int index) {
    this.log.debug("Getting character at index=" + index);
    return this.characters.get(index);
  }

  /**
   * Returns the number of character references in this comic.
   *
   * @return the reference count
   */
  @JsonIgnore
  public int getCharacterCount() {
    return this.characters.size();
  }

  public List<String> getCharacters() {
    return this.characters;
  }

  /**
   * Returns the ComicVine.com unique ID for this comic.
   *
   * @return the id
   */
  public String getComicVineId() {
    return this.comicVineId;
  }

  /**
   * Sets the ComicVine.com unique ID for this comic.
   *
   * @param id the id
   */
  public void setComicVineId(String id) {
    this.log.debug("Setting the comicvine.com id=" + id);
    this.comicVineId = id;
  }

  /**
   * Gthe ComicVine URL for the comic. This corresponds to the site_detail_url value for the comic
   * from their API.
   *
   * @return the URL
   */
  public String getComicVineURL() {
    return this.comicVineURL;
  }

  /**
   * Sets the ComicVine URL for the comic.
   *
   * @param urlL the url
   */
  public void setComicVineURL(String urlL) {
    this.comicVineURL = urlL;
  }

  /**
   * Returns the cover {@link Page}.
   *
   * @return the cover, or <code>null</code> if the comic is empty
   */
  public Page getCover() {
    this.log.debug("Getting cover for comic: filename=" + this.filename);
    /*
     * if there are no pages or the underlying file is missing then show the
     * missing
     * offset image
     */
    return this.pages.isEmpty() || this.isMissing() ? null : this.pages.get(0);
  }

  /**
   * Reports if the underlying comic file is missing.
   *
   * @return <code>true</code> if the file is missing
   */
  @JsonProperty("missing")
  @JsonView(View.ComicList.class)
  public boolean isMissing() {
    if (this.backingFile == null) {
      this.backingFile = new File(this.filename);
    }

    return !this.backingFile.exists();
  }

  /**
   * Returns the cover date for the comic.
   *
   * @return the cover date, or <code>null</code> if no date was set
   */
  public Date getCoverDate() {
    return this.coverDate;
  }

  /**
   * Sets the cover date for the comic.
   *
   * <p>A null cover date is allowed.
   *
   * @param date the cover date
   */
  public void setCoverDate(Date date) {
    this.log.debug("Setting cover date=" + this.formatDate(date));
    this.coverDate = date;
  }

  private String formatDate(Date date) {
    return date != null ? DateFormat.getDateInstance().format(date) : "[NULL]";
  }

  public Set<Credit> getCredits() {
    return this.credits;
  }

  /**
   * Returns the date the comic was added the library.
   *
   * @return the date
   */
  public Date getDateAdded() {
    return this.dateAdded;
  }

  /**
   * Sets the date the comic was added to the library.
   *
   * @param date the date
   */
  public void setDateAdded(Date date) {
    this.log.debug("Setting the date added=" + this.formatDate(date));
    if (date == null) throw new IllegalArgumentException("Date added cannot be null");
    this.dateAdded = date;
  }

  public Date getDateDeleted() {
    return dateDeleted;
  }

  public void setDateDeleted(final Date dateDeleted) {
    this.dateDeleted = dateDeleted;
  }

  /**
   * Returns the number of pages marked as deleted in this comic.
   *
   * @return the deleted offset count
   */
  @Transient
  @JsonProperty("deletedPageCount")
  @JsonView(View.ComicList.class)
  public int getDeletedPageCount() {
    return this.calculatedDeletedPageCount;
  }

  /**
   * Returns the description for the comic.
   *
   * @return the description
   */
  public String getDescription() {
    return this.description;
  }

  /**
   * Sets a description for the comic.
   *
   * @param description the description
   */
  public void setDescription(String description) {
    this.log.debug("Setting description: " + description);
    this.description = description;
  }

  /**
   * Returns the filename for the comic.
   *
   * @return the filename
   */
  public String getFilename() {
    return this.filename;
  }

  /**
   * Sets the filename for the comic.
   *
   * @param filename the filename
   */
  public void setFilename(String filename) {
    this.log.debug("Setting filename: " + filename);
    this.filename = filename;
  }

  /**
   * Returns just the filename portion of the comic file's name.
   *
   * @return the base filename
   */
  @JsonIgnore
  public String getFilenameWithoutExtension() {
    return FilenameUtils.removeExtension(this.filename);
  }

  public ComicFormat getFormat() {
    return this.format;
  }

  public void setFormat(ComicFormat format) {
    this.format = format;
  }

  /**
   * Returns the comic's ID.
   *
   * @return the ID
   */
  public Long getId() {
    return this.id;
  }

  public void setId(final long id) {
    this.id = id;
  }

  public String getImprint() {
    return this.imprint;
  }

  public void setImprint(String imprint) {
    this.log.debug("Setting imprint={}", imprint);
    this.imprint = imprint;
  }

  public int getIndexFor(Page page) {
    if (this.pages.contains(page)) return this.pages.indexOf(page);

    return -1;
  }

  @Transient
  @JsonProperty("sortableIssueNumber")
  @JsonView(View.ComicList.class)
  public String getSortableIssueNumber() {
    final String result = "00000" + (this.issueNumber != null ? this.issueNumber : "");

    return result.substring(result.length() - 5);
  }

  /**
   * Returns the issue number for the comic.
   *
   * @return the issue number
   */
  public String getIssueNumber() {
    return this.issueNumber;
  }

  /**
   * Sets the issue number for the comic.
   *
   * @param issueNumber the issue number
   */
  public void setIssueNumber(String issueNumber) {
    this.log.debug("Setting issue number=" + issueNumber);
    if ((issueNumber != null) && issueNumber.startsWith("0")) {
      this.log.debug("Removing leading 0s from issue number");
      while (issueNumber.startsWith("0") && !issueNumber.equals("0")) {
        issueNumber = issueNumber.substring(1);
      }
    }
    this.issueNumber = issueNumber;
  }

  /**
   * Returns the location referenced at the given index.
   *
   * @param index the index
   * @return the location reference
   */
  public String getLocation(int index) {
    return this.locations.get(index);
  }

  /**
   * Returns the number of location references in the comic.
   *
   * @return the location count
   */
  @JsonIgnore
  public int getLocationCount() {
    return this.locations.size();
  }

  /**
   * Returns the list of locations for this comic.
   *
   * @return the locations
   */
  public List<String> getLocations() {
    return this.locations;
  }

  /**
   * Returns the notes for the issue.
   *
   * @return the notes
   */
  public String getNotes() {
    return this.notes;
  }

  /**
   * Sets the notes for the issue.
   *
   * @param notes the notes
   */
  public void setNotes(String notes) {
    this.log.debug("Setting the notes");
    this.notes = notes;
  }

  /**
   * Returns the offset at the given index.
   *
   * @param index the offset index
   * @return the offset
   */
  public Page getPage(int index) {
    this.log.debug("Returning offset: index=" + index);
    return this.pages.get(index);
  }

  /**
   * Returns the number of pages associated with this comic.
   *
   * @return the offset count
   */
  @Transient
  @JsonProperty("pageCount")
  @JsonView(View.ComicList.class)
  public int getPageCount() {
    if (!this.pages.isEmpty()) return this.pages.size();
    if (this.calculatedPageCount != null) return this.calculatedPageCount.intValue();
    return 0;
  }

  /**
   * Returns all pages for the comic.
   *
   * @return the pages
   */
  public List<Page> getPages() {
    return this.pages;
  }

  /**
   * Returns the publisher series.
   *
   * @return the publisher series
   */
  public String getPublisher() {
    return this.publisher;
  }

  /**
   * Sets the publisher for the comic
   *
   * @param publisher
   */
  public void setPublisher(String publisher) {
    this.log.debug("Setting publisher=" + publisher);
    this.publisher = publisher;
  }

  /**
   * Returns the scan type for the comic.
   *
   * @return the scan type
   */
  public ScanType getScanType() {
    return this.scanType;
  }

  public void setScanType(ScanType scanType) {
    this.scanType = scanType;
  }

  /**
   * Returns the series for the comic.
   *
   * @return the series
   */
  public String getSeries() {
    return this.series;
  }

  /**
   * Sets the series of the comic series.
   *
   * @param series the series
   */
  public void setSeries(String name) {
    this.log.debug("Setting series=" + name);
    this.series = name;
  }

  public String getSortName() {
    return this.sortName;
  }

  public void setSortName(String sortName) {
    this.sortName = sortName;
  }

  /**
   * Retrieves the story arc with the given index.
   *
   * @param index the index
   * @return the story arc series
   */
  public String getStoryArc(int index) {
    this.log.debug("Getting story arc: index=" + index);
    return this.storyArcs.get(index);
  }

  /**
   * Returns the number of story arcs for this comic.
   *
   * @return the story arc count
   */
  @JsonIgnore
  public int getStoryArcCount() {
    this.log.debug("Getting story arc count");
    return this.storyArcs.size();
  }

  /**
   * Returns the list of story arcs.
   *
   * @return the story arcs
   */
  public List<String> getStoryArcs() {
    return this.storyArcs;
  }

  /**
   * Returns the summary for the comic.
   *
   * @return the summary
   */
  public String getSummary() {
    return this.summary;
  }

  /**
   * Sets the summary for the comic.
   *
   * @param summary the summary
   */
  public void setSummary(String summary) {
    this.log.debug("Setting summary: " + summary);
    this.summary = summary;
  }

  /**
   * Returns the team at the given index.
   *
   * @param index
   * @return
   */
  public String getTeam(int index) {
    this.log.debug("Retrieving team index=" + index);
    return this.teams.get(index);
  }

  /**
   * Returns the number of teams in this comic.
   *
   * @return the team count
   */
  @JsonIgnore
  public int getTeamCount() {
    return this.teams.size();
  }

  /**
   * REturns the list of teams in this comic.
   *
   * @return the teams
   */
  public List<String> getTeams() {
    return this.teams;
  }

  /**
   * Returns the title of the issue.
   *
   * @return the title
   */
  public String getTitle() {
    return this.title;
  }

  /**
   * Sets the title for the issue.
   *
   * @param title the title
   */
  public void setTitle(String title) {
    this.log.debug("Setting title=" + title);
    this.title = title;
  }

  /**
   * Returns the comic's volume.
   *
   * @return the volume
   */
  public String getVolume() {
    return this.volume;
  }

  /**
   * Sets the comic's volume.
   *
   * @param volume the volume
   */
  public void setVolume(String volume) {
    this.log.debug("Setting volume=" + volume);
    this.volume = volume;
  }

  @Transient
  @JsonProperty(value = "publishedYear")
  public int getYearPublished() {
    if (this.coverDate != null) {
      GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(this.coverDate);
      return calendar.get(Calendar.YEAR);
    }
    return 0;
  }

  /**
   * Returns whether the comic has characters or not.
   *
   * @return true if the comic has character references
   */
  public boolean hasCharacters() {
    return !this.characters.isEmpty();
  }

  /**
   * Reports if the comic contains any location references.
   *
   * @return true if the comic references locations
   */
  public boolean hasLocations() {
    return !this.locations.isEmpty();
  }

  /**
   * Returns whether a offset with the given filename is present.
   *
   * @param filename the filename
   * @return true if such a offset exists
   */
  public boolean hasPageWithFilename(String filename) {
    return this.getPageWithFilename(filename) != null;
  }

  /**
   * Returns the offset for the given filename.
   *
   * @param filename
   * @return the {@link Page} or null
   */
  public Page getPageWithFilename(String filename) {
    if (this.pages.isEmpty()) return null;
    for (Page page : this.pages) {
      if (page.getFilename().equals(filename)) return page;
    }

    return null;
  }

  /**
   * Returns if the comic is a part of any story arcs.
   *
   * @return true if there are story arcs
   */
  public boolean hasStoryArcs() {
    return !this.storyArcs.isEmpty();
  }

  /**
   * Returns if the comic contains and team references.
   *
   * @return true if teams are present
   */
  public boolean hasTeams() {
    return !this.teams.isEmpty();
  }

  public void sortPages() {
    this.pages.sort((Page p1, Page p2) -> p1.getFilename().compareTo(p2.getFilename()));
    for (int index = 0; index < this.pages.size(); index++) {
      this.pages.get(index).setPageNumber(index);
    }
  }

  public Long getNextIssueId() {
    return nextIssueId;
  }

  public void setNextIssueId(final Long nextIssueId) {
    this.nextIssueId = nextIssueId;
  }

  public Long getPreviousIssueId() {
    return previousIssueId;
  }

  public void setPreviousIssueId(final Long previousIssueId) {
    this.previousIssueId = previousIssueId;
  }

  public ComicFileDetails getFileDetails() {
    return fileDetails;
  }

  public void setFileDetails(final ComicFileDetails fileDetails) {
    fileDetails.setComic(this);
    this.fileDetails = fileDetails;
  }

  @Transient
  public File getFile() {
    return new File(this.filename);
  }

  public Integer getDuplicateCount() {
    return (this.duplicateCount != null) ? (this.duplicateCount - 1) : 0;
  }

  public Set<ReadingList> getReadingLists() {
    return this.readingLists;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Comic comic = (Comic) o;
    return this.filename.equals(comic.getFilename());
  }

  @Override
  public int hashCode() {
    return 17 * Objects.hash(filename);
  }
}
