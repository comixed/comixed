/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.app;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertNull;

import java.io.IOException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.comixedproject.model.net.app.LatestReleaseDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@ExtendWith(MockitoExtension.class)
class GetLatestReleaseActionTest {
  private static final String TEST_BAD_DATA = "This is not ATOM data";
  private static final String TEST_RELEASE_FEED =
      """
          <?xml version="1.0" encoding="UTF-8"?>
          <feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xml:lang="en-US">
            <id>tag:github.com,2008:https://github.com/comixed/comixed/releases</id>
            <link type="text/html" rel="alternate" href="https://github.com/comixed/comixed/releases"/>
            <link type="application/atom+xml" rel="self" href="https://github.com/comixed/comixed/releases.atom"/>
            <title>Release notes from comixed</title>
            <updated>2022-05-07T10:58:05-04:00</updated>
            <entry>
              <id>tag:github.com,2008:Repository/222923662/v1.0.3-1</id>
              <updated>2022-05-07T11:48:02-04:00</updated>
              <link rel="alternate" type="text/html" href="https://github.com/comixed/comixed/releases/tag/v1.0.3-1"/>
              <title>Changes For 1.0.3-1</title>
              <content type="html">&lt;h2&gt;Commits&lt;/h2&gt;
          &lt;ul&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/c9a584ef3ff588ce3285af98f3243a633a217e76/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/c9a584ef3ff588ce3285af98f3243a633a217e76&quot;&gt;&lt;tt&gt;c9a584e&lt;/tt&gt;&lt;/a&gt;: Fixed sorting and archive filters in collections [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1213066485&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1239&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1239/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1239&quot;&gt;#1239&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/b52365ade9365aec5f9229d02e7672705af06bcb/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/b52365ade9365aec5f9229d02e7672705af06bcb&quot;&gt;&lt;tt&gt;b52365a&lt;/tt&gt;&lt;/a&gt;: Fixed when consolidating a comic to its current filename [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1213303959&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1241&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1241/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1241&quot;&gt;#1241&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/09fd5f56440b01a094b7cd68b769e5a6e2a112c6/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/09fd5f56440b01a094b7cd68b769e5a6e2a112c6&quot;&gt;&lt;tt&gt;09fd5f5&lt;/tt&gt;&lt;/a&gt;: Fixed the metadata audit log comic link [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1223478213&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1265&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1265/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1265&quot;&gt;#1265&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/0edd4e583681cb0f2f0c6b1e9ac78bd8b14edc28/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/0edd4e583681cb0f2f0c6b1e9ac78bd8b14edc28&quot;&gt;&lt;tt&gt;0edd4e5&lt;/tt&gt;&lt;/a&gt;: Changed the release version to 1.0.3-1 [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1181715362&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1178&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1178/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1178&quot;&gt;#1178&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;/ul&gt;</content>
              <author>
                <name>github-actions[bot]</name>
              </author>
              <media:thumbnail height="30" width="30" url="https://avatars.githubusercontent.com/in/15368?s=60&amp;v=4"/>
            </entry>
            <entry>
              <id>tag:github.com,2008:Repository/222923662/v1.0.2-1</id>
              <updated>2022-04-22T21:46:28-04:00</updated>
              <link rel="alternate" type="text/html" href="https://github.com/comixed/comixed/releases/tag/v1.0.2-1"/>
              <title>Changes For 1.0.2-1</title>
              <content type="html">&lt;h2&gt;Commits&lt;/h2&gt;
          &lt;ul&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/a90d2d078bf402d17ad4ee44e367a80c6bbe4461/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/a90d2d078bf402d17ad4ee44e367a80c6bbe4461&quot;&gt;&lt;tt&gt;a90d2d0&lt;/tt&gt;&lt;/a&gt;: Fixed loading null publishers and series for OPDS [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1206119897&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1231&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1231/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1231&quot;&gt;#1231&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/8c09a5afe809b73759e4944b61d20ab16cf88e59/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/8c09a5afe809b73759e4944b61d20ab16cf88e59&quot;&gt;&lt;tt&gt;8c09a5a&lt;/tt&gt;&lt;/a&gt;: Fixed whitelabel error page [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1196492700&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1223&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1223/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1223&quot;&gt;#1223&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/e091943b15536f21fe06f6eb8895c6caf07ca97d/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/e091943b15536f21fe06f6eb8895c6caf07ca97d&quot;&gt;&lt;tt&gt;e091943&lt;/tt&gt;&lt;/a&gt;: Fixed sidenav not closing when option is selected [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1191738646&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1220&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1220/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1220&quot;&gt;#1220&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/2c560e5a67241bad52201d9fed294d03c9563c6f/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/2c560e5a67241bad52201d9fed294d03c9563c6f&quot;&gt;&lt;tt&gt;2c560e5&lt;/tt&gt;&lt;/a&gt;: Fixed incorrectly limiting the metadata volumes fetch [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1208934588&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1235&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1235/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1235&quot;&gt;#1235&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/b2ec9161648a9a76d154e09a61ad6650d0349808/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/b2ec9161648a9a76d154e09a61ad6650d0349808&quot;&gt;&lt;tt&gt;b2ec916&lt;/tt&gt;&lt;/a&gt;: Fixed side navigation badges not showing correctly [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1181760462&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1179&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1179/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1179&quot;&gt;#1179&lt;/a&gt;] (BRUCELLA2)&lt;/li&gt;
          &lt;li&gt;&lt;a class=&quot;commit-link&quot; data-hovercard-type=&quot;commit&quot; data-hovercard-url=&quot;https://github.com/comixed/comixed/commit/a4ac0d64c684867b7a5a14ef69fb9b714be2fa15/hovercard&quot; href=&quot;https://github.com/comixed/comixed/commit/a4ac0d64c684867b7a5a14ef69fb9b714be2fa15&quot;&gt;&lt;tt&gt;a4ac0d6&lt;/tt&gt;&lt;/a&gt;: Changed the release version to 1.0.2-1 [&lt;a class=&quot;issue-link js-issue-link&quot; data-error-text=&quot;Failed to load title&quot; data-id=&quot;1181715362&quot; data-permission-text=&quot;Title is private&quot; data-url=&quot;https://github.com/comixed/comixed/issues/1178&quot; data-hovercard-type=&quot;issue&quot; data-hovercard-url=&quot;/comixed/comixed/issues/1178/hovercard&quot; href=&quot;https://github.com/comixed/comixed/issues/1178&quot;&gt;#1178&lt;/a&gt;] (Darryl L. Pierce)&lt;/li&gt;
          &lt;/ul&gt;</content>
              <author>
                <name>github-actions[bot]</name>
              </author>
              <media:thumbnail height="30" width="30" url="https://avatars.githubusercontent.com/in/15368?s=60&amp;v=4"/>
            </entry>
          </feed>
          """;

  @InjectMocks private GetLatestReleaseAction action;

  private MockWebServer githubServer;

  @BeforeEach
  public void setUp() throws IOException {

    githubServer = new MockWebServer();
    githubServer.start();

    final String hostname = String.format("http://localhost:%s", this.githubServer.getPort());
    action.setUrl(hostname);
  }

  @AfterEach
  public void tearDown() throws IOException {
    githubServer.shutdown();
  }

  @Test
  void execute_badContent() {
    this.githubServer.enqueue(
        new MockResponse()
            .setBody(TEST_BAD_DATA)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    final LatestReleaseDetails result = action.execute();

    assertNotNull(result);
    assertNull(result.getVersion());
    assertNull(result.getReleased());
    assertNull(result.getUrl());
  }

  @Test
  void execute() {
    this.githubServer.enqueue(
        new MockResponse()
            .setBody(TEST_RELEASE_FEED)
            .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE));

    final LatestReleaseDetails result = action.execute();

    assertNotNull(result);
    assertNotNull(result.getVersion());
    assertNotNull(result.getReleased());
    assertNotNull(result.getUrl());
  }
}
