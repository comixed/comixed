/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.library.model;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <code>Comic</code> represents a single digital comic issue.
 *
 * @author Darryl L. Pierce
 *
 */
@Entity
@Table(name = "comics")
public class Comic
{
    @Transient
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename",
            nullable = false,
            unique = true)
    private String filename;

    @Column(name = "comic_vine_id")
    private String comicVineId;

    @Column(name = "added_date",
            updatable = false,
            nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateAdded = new Date();

    @Column(name = "cover_date",
            nullable = true)
    @Temporal(TemporalType.DATE)
    private Date coverDate;

    @Column(name = "last_read_date",
            nullable = true)
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastReadDate;

    @Column(name = "volume")
    private String volume;

    @Column(name = "issue_number")
    private String issueNumber;

    @Column(name = "description")
    private String description;

    @Column(name = "summary")
    private String summary;

    @ElementCollection
    @LazyCollection(LazyCollectionOption.FALSE)
    @CollectionTable(name = "comic_story_arcs",
                     joinColumns = @JoinColumn(name = "comic_id"))
    @Column(name = "story_arc_name")
    private List<String> storyArcs = new ArrayList<>();

    @ElementCollection
    @LazyCollection(LazyCollectionOption.FALSE)
    @CollectionTable(name = "comic_teams",
                     joinColumns = @JoinColumn(name = "comic_id"))
    @Column(name = "team_name")
    private List<String> teams = new ArrayList<>();

    @ElementCollection
    @LazyCollection(LazyCollectionOption.FALSE)
    @CollectionTable(name = "comic_characters",
                     joinColumns = @JoinColumn(name = "comic_id"))
    @Column(name = "character_name")
    private List<String> characters = new ArrayList<>();

    @ElementCollection
    @LazyCollection(LazyCollectionOption.FALSE)
    @CollectionTable(name = "comic_locations",
                     joinColumns = @JoinColumn(name = "comic_id"))
    @Column(name = "location_name")
    private List<String> locations = new ArrayList<>();

    @OneToMany(mappedBy = "comic",
               cascade = CascadeType.ALL,
               fetch = FetchType.EAGER)
    @OrderColumn(name = "index")
    private List<Page> pages = new ArrayList<Page>();

    /**
     * Adds a character to the comic.
     *
     * @param character
     *            the character
     */
    public void addCharacter(String character)
    {
        this.logger.debug("Adding character=" + character);
        if (this.characters.contains(character))
        {
            this.logger.debug("Duplicate character");
            return;
        }
        this.characters.add(character);
    }

    /**
     * Adds a new location reference to the comic.
     *
     * @param location
     *            the location
     */
    public void addLocation(String location)
    {
        this.logger.debug("Adding location=" + location);
        if (this.locations.contains(location))
        {
            this.logger.debug("Duplication location");
            return;
        }
        this.locations.add(location);
    }

    /**
     * Adds a new page to the comic.
     *
     * @param index
     *            the index
     *
     * @param page
     *            the page
     */
    public void addPage(int index, Page page)
    {
        this.logger.debug("Adding page: index=" + index + " hash=" + page.getHash());
        page.setComic(this);
        this.pages.add(index, page);
    }

    /**
     * Adds a story arc to the comic.
     *
     * @param name
     *            the story arc name
     */
    public void addStoryArc(String name)
    {
        this.logger.debug("Adding story arc=" + name);
        if (this.storyArcs.contains(name))
        {
            this.logger.debug("Duplicate story arc");
            return;
        }
        this.storyArcs.add(name);
    }

    /**
     * Adds the given team to the comic.
     *
     * @param team
     *            the team
     */
    public void addTeam(String team)
    {
        this.logger.debug("Adding team=" + team);
        if (this.teams.contains(team))
        {
            this.logger.debug("Duplicate team");
            return;
        }
        this.teams.add(team);
    }

    /**
     * Removes all character references.
     */
    public void clearCharacters()
    {
        this.characters.clear();
    }

    /**
     * Removes all location references from the comic.
     */
    public void clearLocations()
    {
        this.logger.debug("Clearing location references");
        this.locations.clear();
    }

    /**
     * Clears out all story arc references.
     */
    public void clearStoryArcs()
    {
        this.logger.debug("Clearing story arcs");
        this.storyArcs.clear();
    }

    /**
     * Deletes a page from the comic.
     *
     * @param index
     *            the page index
     */
    public void deletePage(int index)
    {
        this.logger.debug("Deleting page: index=" + index);
        this.pages.remove(index);
    }

    /**
     * Returns the character reference at the given index.
     *
     * @param index
     *            the index
     * @return the character reference
     */
    public String getCharacter(int index)
    {
        this.logger.debug("Getting character at index=" + index);
        return this.characters.get(index);
    }

    /**
     * Returns the number of character references in this comic.
     *
     * @return the reference count
     */
    public int getCharacterCount()
    {
        return this.characters.size();
    }

    /**
     * Returns the ComicVine.com unique ID for this comic.
     *
     * @return the id
     */
    public String getComicVineId()
    {
        return this.comicVineId;
    }

    /**
     * Returns the cover date for the comic.
     *
     * @return the cover date, or <code>null</code> if no date was set
     */
    public Date getCoverDate()
    {
        return this.coverDate;
    }

    /**
     * Returns the date the comic was added the library.
     *
     * @return the date
     */
    public Date getDateAdded()
    {
        return this.dateAdded;
    }

    /**
     * Returns the date the comic was lsat read.
     *
     * @return the last read date
     */
    public Date getDateLastRead()
    {
        return this.lastReadDate;
    }

    /**
     * Returns the description for the comic.
     *
     * @return the description
     */
    public String getDescription()
    {
        return this.description;
    }

    /**
     * Returns the filename for the comic.
     *
     * @return the filename
     */
    public String getFilename()
    {
        return this.filename;
    }

    /**
     * Returns the comic's ID.
     *
     * @return the ID
     */
    public Long getId()
    {
        return this.id;
    }

    /**
     * Returns the issue number for the comic.
     *
     * @return the issue number
     */
    public String getIssueNumber()
    {
        return this.issueNumber;
    }

    /**
     * Returns the location referenced at the given index.
     *
     * @param index
     *            the index
     * @return the location reference
     */
    public String getLocation(int index)
    {
        return this.locations.get(index);
    }

    /**
     * Returns the number of location references in the comic.
     *
     * @return the location count
     */
    public int getLocationCount()
    {
        return this.locations.size();
    }

    /**
     * Returns the page at the given index.
     *
     * @param index
     *            the page index
     * @return the page
     */
    public Page getPage(int index)
    {
        this.logger.debug("Returning page: index=" + index);
        return this.pages.get(index);
    }

    /**
     * Returns the number of pages associated with this comic.
     *
     * @return the page count
     */
    public int getPageCount()
    {
        return this.pages.size();
    }

    /**
     * Retrieves the story arc with the given index.
     *
     * @param index
     *            the index
     * @return the story arc name
     */
    public String getStoryArc(int index)
    {
        this.logger.debug("Getting story arc: index=" + index);
        return this.storyArcs.get(index);
    }

    /**
     * Returns the number of story arcs for this comic.
     *
     * @return the story arc count
     */
    public int getStoryArcCount()
    {
        this.logger.debug("Getting story arc count");
        return this.storyArcs.size();
    }

    /**
     * Returns the summary for the comic.
     *
     * @return the summary
     */
    public String getSummary()
    {
        return this.summary;
    }

    /**
     * Returns the team at the given index.
     *
     * @param index
     * @return
     */
    public String getTeam(int index)
    {
        this.logger.debug("Retrieving team index=" + index);
        return this.teams.get(index);
    }

    /**
     * Returns the number of teams in this comic.
     *
     * @return the team count
     */
    public int getTeamCount()
    {
        return this.teams.size();
    }

    /**
     * Returns the comic's volume.
     *
     * @return the volume
     */
    public String getVolume()
    {
        return this.volume;
    }

    /**
     * Returns whether the comic has characters or not.
     *
     * @return true if the comic has character references
     */
    public boolean hasCharacters()
    {
        return (this.characters.isEmpty() == false);
    }

    /**
     * Reports if the comic contains any location references.
     *
     * @return true if the comic references locations
     */
    public boolean hasLocations()
    {
        return (this.locations.isEmpty() == false);
    }

    /**
     * Returns if the comic is a part of any story arcs.
     *
     * @return true if there are story arcs
     */
    public boolean hasStoryArcs()
    {
        return this.storyArcs.isEmpty() == false;
    }

    /**
     * Returns if the comic contains and team references.
     *
     * @return true if teams are present
     */
    public boolean hasTeams()
    {
        return (this.teams.isEmpty() == false);
    }

    /**
     * Sets the ComicVine.com unique ID for this comic.
     *
     * @param id
     *            the id
     */
    public void setComicVineId(String id)
    {
        this.logger.debug("Setting the comicvine.com id=" + id);
        this.comicVineId = id;
    }

    /**
     * Sets the cover date for the comic.
     *
     * A null cover date is allowed.
     *
     * @param date
     *            the cover date
     */
    public void setCoverDate(Date date)
    {
        this.logger.debug("Setting cover date=" + this.formatDate(date));
        this.coverDate = date;
    }

    /**
     * Sets the date the comic was added to the library.
     *
     * @param date
     *            the date
     */
    public void setDateAdded(Date date)
    {
        this.logger.debug("Setting the date added=" + this.formatDate(date));
        if (date == null) throw new IllegalArgumentException("Date added cannot be null");
        this.dateAdded = date;
    }

    /**
     * Sets the date the comic was last read.
     *
     * @param date
     *            the last read date
     */
    public void setDateLastRead(Date date)
    {
        this.logger.debug("Setting last read date=" + this.formatDate(date));
        this.lastReadDate = date;
    }

    /**
     * Sets a description for the comic.
     *
     * @param description
     *            the description
     */
    public void setDescription(String description)
    {
        this.logger.debug("Setting description: " + description);
        this.description = description;
    }

    /**
     * Sets the filename for the comic.
     *
     * @param filename
     *            the filename
     */
    public void setFilename(String filename)
    {
        this.logger.debug("Setting filename: " + filename);
        this.filename = filename;
    }

    /**
     * Sets the issue number for the comic.
     *
     * @param issueNumber
     *            the issue number
     */
    public void setIssueNumber(String issueNumber)
    {
        this.logger.debug("Setting issue number=" + issueNumber);
        this.issueNumber = issueNumber;
    }

    /**
     * Sets the summary for the comic.
     *
     * @param summary
     *            the summary
     */
    public void setSummary(String summary)
    {
        this.logger.debug("Setting summary: " + summary);
        this.summary = summary;
    }

    /**
     * Sets the comic's volume.
     *
     * @param volume
     *            the volume
     */
    public void setVolume(String volume)
    {
        this.logger.debug("Setting volume=" + volume);
        this.volume = volume;
    }

    private String formatDate(Date date)
    {
        return date != null ? DateFormat.getDateInstance().format(date) : "[NULL]";
    }
}
