# Release notes.

### 2018-12-31: Release 0.3.0-RC4
  #368:  Scraping, clearing a scraping a comic again does not update the metadata.
  #367:  Comic title is not being updated when scraping a single comic
  #364:  ComicVine API key not trimmed
  #361:  Error when opening the webapp (linux)
  #360:  The library status is not immediately sent back on when an import starts
  #359:  Comic details view is caching previous comic details
  #358:  During comic scraping, the comic details aren't showing up in the library view
  #357:  Details button is not working on the library details view
  #355:  Multi-comic scraping doesn't seem to be saving the scraped information
  #352:  Turn off excessive logging

### 2018-12-21: Release 0.3.0-RC3
  #349:  Import title doesn't show the number of comics selected.
  #351:  When comics are importing, new pages aren't shown in either the details or cover views.
  #343:  Cannot block pages from the comic details pages view

### 2018-12-19: Release 0.3.0-RC2
  #348:  Clicking on Save on the comic details screen results in a error.
  #346:  Can't read the import path field
  #344:  The duplicate pages grid view shows two trash cans when only some duplicates are deleted
  #342:  Scan type, format and sort name are not updated in the browser.
  #341:  Viewing the pages in grid view on the comic details page, the images are too large
  #340:  Clearing the metadata is still not immediately reflected in the page view

### 2018-12-15: Release 0.3.0-RC1
  #334: Improve the comic details dialog on the library page
  #332: Update the import page busy indicator to match the comics editor busy indicator
  #330: Status bar has no background...
  #329: Importing status should take a timeout period
  #328: Move importing to use the store
  #326: Users can view their settings
  #324: Add protections to user- and admin-specific features.
  #323: Set the last login date when the user authenticates
  #322: Add the ability to rescan comics in the library
  #321: The size of each page is not being stored in the database.
  #318: Adjust the column widths on the fetched volumes table
  #317: Do not show the full cover image in the library details view
  #316: Add sorting to the library details view
  #315: Volume table on the scraping page does not show the publisher
  #314: Add sorting to the volume list table on the comic scraping page
  #313: When fetching candidates while scraping data for a comic, there should be an option to bypass any cached results
  #312: ComicVine query cache should have a time-to-live
  #311: Move user preferences to the store
  #310: On the initial import, the library does not update...
  #309: Move the library page elements into separate components.
  #307: Move remote comic monitoring to the new library store
  #306: Cover date is not getting scraped
  #304: Move library display state into the store
  #303: Replace subscribing to the ComicService.all_comics list with an NgRx store.
  #301: Provide a means for scraping the data for multiple comics from ComicVine
  #300: Added selected comics overlay and toolbar to the import page
  #299: Comics aren't being loaded on the library during page navigation
  #298: Duplicate page query not returning blocked page status.
  #296: Refactor the duplicate hashes REST API to return a count as well as the hash
  #295: Mark all instances of a duplicate page as deleted or blocked from the duplicates page
  #294: From the duplicates page I can go to a page showing the comics with that page.
  #292: Replace comic covers with PrimeNG cards.
  #291: Move the comic credits content to PrimeNG cards
  #290: After fetching a comic's details, the previous fetched data should be hidden
  #289: When getting metadata for a comic, and none available, then no Cancel button is present
  #288: Replace the library page table view with a PrimeNG table.
  #287: Replace the library page tabs with PrimeNG elements.
  #286: Replace the messages display with PrimeNG Toast popups
  #285: Remove any explicit dependency on Bootstrap
  #284: Remove the comic.module.ts class  
  #283: Replace the Import sidebar with a PrimeNG Sidebar.
  #282: Replace the comic library sidebar with a PrimeNG Sidebar.
  #281: Replace the current navbar with a PrimeNG Menubar.
  #280: Convert visual elements on the comic details page to PrimeNG
  #279: Show the list of comic candidates in a table on the ComicVine tab
  #278: On the Library page, the initial tab to show can be passed in the URL
  #273: Make the ComicVine API key a label unless the user clicks a button to edit it.
  #272: Scraped metadata not shown immediately
  #270: Replace the "Cancel" button with a "Reset" button on the ComicVine tab
  #269: On the comic details page, the tab to initially show can be passed in the URL
  #267: Move services into a single directory
  #266: Add a details table view to the library page
  #265: Clicking Save on the edit comic page doesn't update the series, volume or issue on the same page
  #264: Add a button to clear all meta data for a comic
  #263: Checking for library updates should be less network intensive
  #261: Store the last import directory
  #260: No save button
  #257: Display alert messages in a stack that does not move the displayed content
  #256: Scrapped comics info link to comicvine
  #255: Include a "Clear All" link in the first error message show
  #253: Security
  #252: Upgrade tika-core to 1.19
  #251: After scraping a comic, the issue title and subtitle are not updated on the details page
  #250: [SECURITY] Upgrade JUnrar to 1.0.1
  #248: "Scan Type" field
  #245: Imprint Field
  #244: Format field
  #242: Users can change the sort name for a comic.
  #241: Comics have a Sort Name field.
  #232: The layout of the duplicate pages view is uneven
  #231: Move the import comic details box to a modal dialog
  #230: Information alerts should disappear after a short time
  #229: Reuse the cover details view from the library page on the import comics page
  #227: Use the same page component for importing comics,  viewing the library, viewing duplicate pages, etc.
  #224: The import comic details box is not hidden after clicking Find Comics...
  #223: Search box and import box should not scroll with the content
  #222: Comic descriptions are show with HTML markup
  #220: The Edit Comic Data layout is uneven
  #219: The Edit Comic Data layout needs to be adjusted.
  #218: After importing, the details panel is not hidden
  #217: The Select and Close buttons are not centered
  #216: Navigation and left column overlap on the import comics page
  #215: Import button label sizes are inconsistent
  #214: Import page button labels are clipped
  #213: The busy indicator message should not look like it's part of the overlayed page...
  #212: The comic count on the home page should be a link to the library view...
  #211: Left hand columns should sit flush to the left of the browser
  #210: Navigation bar and left column overlap on the library view page.
  #209: The publisher is not being scraped
  #208: User preferences are not available on a full page reload
  #207: Add searching to the import comics page
  #206: Select comics in the library view and scrape
  #205: Add tabbing to the comic details view page
  #203: Store the ComicVine API key when it's entered, fetch it when needed
  #202: Cache results for issues retrieved form ComicVine
  #200: Add a new filename format to the filename scraper: filenames container a "(of ##)"
  #199: Refactor the comic library overlays to look like the comic import overlays
  #198: Importing comics on Windows fails to show covers on candidate comics.
  #193: The overlay on the comic import page can sometimes affect the next row of covers
  #192: When on the comic details page for a non-existent comic, redirect to the home page

### 2018-07-15: Release 0.1-RC1 
### 2018-07-23: Release 0.1-RC2
### 2018-07-29: Release 0.1-RC3
 * #121  The app should attempt to get the series and issue numbers from the filename for imported comics.
 * #119  Add a "Quick Start" guide for running the application
 * #118  Reader without ADMIN role are able to import comics.
 * #115  NullPointerException when changing username.
 * #113  When changing the account password, display a message when the passwords don't match.
 * #111  Release candidate contains development application.properties file.
 * #108  Make the library footer global.
 * #105  Need to document default password
 * #98   Show comic pages as cards
 * #97   Add a Show link to the details modal
 * #95   Add a slider to the library view for resizing the cover images
 * #94   Show comic covers as a card  
 * #92   When sorting by series, the comics should be then subsorted by volume and then issue.  
 * #89   Reloading a page doesn't work  
 * #88   A user can change their email address and their password.   
 * #86   The comic search and display card can be shown and hidden.  
 * #85   Deploy the Angular front end embedded within the Spring Boot app  
 * #84   Send a date when requesting the list of all comics to limit the return value  
 * #82   Add a footer to show system statistics  
 * #81   Filenames are too long   
 * #78   Move the library options to a drop down menu
 * #77   The number of comics on the screen can be limited and scrolled.
 * #76   The comic list screen does not scroll the sort and filter boxes
 * #75   Confirm the deletion of a comic.
 * #74   Users can read the pages of a comic
 * #73   Indicate when a comic file is missing.  
 * #72   The user can select all comics for import
 * #71   Unable to load single image files from CBR comics  
 * #70   Save the image width and height in the database.
 * #69   Fix the comic count API.
 * #68   The list of duplicate pages can be viewed.   
 * #64   Import comics with an Import button  
 * #62   Fix the navigation bar  
 * #61   The comic details page shows a link to the ComicVine website.  
 * #58   Display the publication date in the comic list.  
 * #57   Users can sort the comics being displayed  
 * #56   Move the Java code to a subdirectory.
 * #54   Comics can be removed from the library.   
 * #51   Clicking on a comic's View button in the list opens the comic's details page   
 * #50   Users can download a comic from the comic list.   
 * #49   The comic's description is displayed when the user's mouse hovers over the cover.  
 * #48   The width of the cover in the comic list is configurable    
 * #47   The user is shown feedback during the comic import process.   
 * #46   The cover is displayed in the comic list.   
 * #42   Users must log into the library to access the comics   
 * #35   A page can be marked as "Deleted".   
 * #33   The comic pages are displayed as an array in the comic's details view.  
 * #31   Comics can be imported en masse   
 * #30   Add an Angular front-end.
 * #29   The application has a main page   
 * #28   Convert the application to a self-contained web application.
 * #27   Add menu options for selecting and deselecting all comics
 * #26   Scaled images should be cached on disk for easy retrieval
 * #25   Comic covers aren't scaling properly in the cover flow pane.
 * #24   Covers stopped displaying
 * #23   [Linux] Add comic file not showing any comic files    linux
 * #22   Some comics aren't properly being converted.
 * #21   The details view does not maintain its state across runs
 * #20   Make the JAR executable.
 * #19   Exporting a comic should prompt before beginning
 * #17   ArrayIndexOutOfBoundsException thrown if editing a details field and then a different comic is selected
 * #16   Show missing comics  
 * #14   Only display the selected comic covers.
 * #13   Move the delete file option into the remove comic dialog
 * #12   Moving a detail view column should be persisted across runs of the application.
 * #11   Should be able to show/hide comic details columns.
 * #10   Changing the size of details columns should be persisted.  
 * #9  Move the library details to the statusbar.
 * #8  Provide feedback when importing comics
 * #7    Fix the popup menus for selections in the details view.
 * #6  Filter the comics displayed  
 * #5    Importing large numbers of comics makes the application unusable
 * #4  Move details popup to the cover flow panel
 * #2    Item height or selectable display mode for library
 * #1    Exception handling on external library change

### Known Bugs
 * #107  Not being redirected to the login page
 * #100  Logout link does not work
 * #99   Duplicate page view isn't working
 * #90   Sorts aren't always honored
 * #18   Error on consolidating library
