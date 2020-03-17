# Release notes.

### 2020-03-17: Release 0.5.2-1.1
  #173  Revert changes introduced since they created a new bug.
  [CVE-2020-7598] Bump acorn from 6.4.0 to 6.4.1 in /comixed-frontend (#186

### 2020-03-13: Release 0.5.2-1
  #178  Unable to import from root of drive.

### 2020-03-09: Release 0.5.1-1
  #174  [Issue #173] Fix loading the first image from a 7zip encoded archive.
  #173  Unable to open a file archived with 7zip.
  #171  Fix the frontend state references
  #167  Issue #166: Remove uniqueness constraint from book in bookmarks table.
  #166  Importer fails on second bookmark

### 2020-01-27: Release 0.5.0-0.1
  #136  Feature/issue 133
  #133  Redirect the user to the home page when their session expires 
  #131  [Issue #130] Allow a comic to have an issue number of "0"  
  #130  When scraping an comic with an issue number of 0, no data is retrieved 
  #129  [Issue #123] Allow skipping the cache when scraping the selected issue.  
  #128  [Issue #127] Remove labels from import toolbar and standardize the remaining buttons.  
  #127  Remove label from import blocking page button and add tooltip 
  #126  [Issue #125] Fix collection links on comic details page.  
  #125  Links from the comic details page for collections are broken
  #124  [Issue #119] Limit the fields returned in a publisher details query.
  #123  Add skip cache flag when scraping the selected issue
  #119  Limit the fields returned when doing a publisher details scrape
  #118  [Issue #117] Fix getting the next and previous comic for a series.
  #117  Getting the next comic in a series does not return a single comic
  #116  [Issue #115] Simplify select all/none buttons to just icons.
  #115  Standardize select all/none buttons on all toolbars to a simple icon with no text
  #114  [Issue #105] Set the next/previous issue id when getting the details for a single comic.
  #111  [Issue #3] Pages can be marked for deletion from the duplicates page.
  #110  Feature/issue 9
  #109  Comixed isn't starting anymore (Tomcat won't start)
  #105  Disable setting the next/previous comic when retrieving a single comic.
  #103  Menu text not displaying correctly in latest pre-release.
  #102  Feature/issue 100
  #99   When retrieving a list of comics, returning a minimal set of fields per comic.
  #97   [Issue #81] Updated versions to 0.5.0-PRERELEASE.
  #96   [Issue #95] Replace ${HOME} with ${user.home} for the cache directory.
  #95   0.5.0-PRERELEASE-20191209002126 failing on launch.
  #93   CB7 archive adaptor tests use target directory.
  #92   Fix display of blocked duplicate pages.
  #91   Minor Dockerfile and descriptions updates
  #90   Cache image files outside of the comic archive
  #89   Cache pages from comics after initial access.
  #88   Re-implement the multi-comic scraping workflow.
  #87   Remove the library filtering [library] 0.5 @mcpierce 
  #86   [Issue #87] Removed library filtering. [library] 0.5 1  
  #85   [Issue #59] Update workflow to publish release artifacts from the develop branch.
  #84   Comic selections are not being saved across pages
  #83   [Issue #49] Reduce the number of components needed to view collections.
  #81   Bump the comixed-importer version to 0.5.0-PRERELEASE
  #73   [Issue #68] Rollback maven-git-code-format to 1.36.
  #68   CreateProcess not a valid Win32 application
  #67   Feature/issue 63
  #63   Comics are loaded one page at a time
  #62   [Issue #60] Publish the build artifact to Github.
  #61   Clean up the Google Java format plugin configuration.
  #60   Deploy the release artifacts
  #59   Will the dockerhub account change to comixed/comixed?
  #58   [BUILD] Bumped maven-git-code-format to v1.37
  #55   maven github action
  #53   Add profiles for build
  #49   Replace all of the list and details pages with a simpler model.
  #27   Comic pages should be cached for quicker access
  #14   List view - allow user to sort ascending or descending
  #9    After importing comics, not all are being returned while being processed
  #7    The comixed-library module creates junk archives during unit tests
  #3    Pages can be marked as deleted from the duplicates page
  #2    Duplicates pages are always returning blocked=false even when the page hash is blocked
  #1    Re-implement the multi-comic scraping workflow
