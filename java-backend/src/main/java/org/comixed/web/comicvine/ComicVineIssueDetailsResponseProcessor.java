/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.web.comicvine;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.StringTokenizer;

import org.comixed.library.model.Comic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ComicVineIssueDetailsResponseProcessor
{
    private SimpleDateFormat simpleDataFormat = new SimpleDateFormat("yyyy-MM-dd");

    @Autowired
    private ObjectMapper objectMapper;

    public String process(byte[] content, Comic comic) throws ComicVineAdaptorException
    {
        try
        {
            // TODO there HAS to be a better way to configure this
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            JsonNode jsonNode = objectMapper.readTree(content);

            applyDetails(jsonNode, comic);

            return jsonNode.get("results").get("volume").get("id").asText();
        }
        catch (IOException
               | ParseException error)
        {
            throw new ComicVineAdaptorException("Unable to process issue details", error);
        }
    }

    private void applyDetails(JsonNode jsonNode, Comic comic) throws ParseException
    {
        JsonNode results = jsonNode.get("results");

        comic.setComicVineId(results.get("id").asText());
        comic.setDescription(results.get("description").asText());
        comic.setSeries(results.get("volume").get("name").asText());
        comic.setIssueNumber(results.get("issue_number").asText());
        comic.setTitle(results.get("name").asText());
        comic.setCoverDate(simpleDataFormat.parse(results.get("cover_date").asText()));

        // apply the characters
        comic.clearCharacters();
        if (results.has("character_credits"))
        {
            JsonNode characters = results.get("character_credits");
            int index = 0;

            while (characters.has(index))
            {
                JsonNode character = characters.get(index++);
                comic.addCharacter(character.get("name").asText());
            }
        }

        // apply locations
        comic.clearLocations();
        if (results.has("location_credits"))
        {
            JsonNode locations = results.get("location_credits");
            int index = 0;

            while (locations.has(index))
            {
                JsonNode character = locations.get(index++);
                comic.addLocation(character.get("name").asText());
            }
        }

        // apply story archs
        comic.clearStoryArcs();
        if (results.has("story_arc_credits"))
        {
            JsonNode stories = results.get("story_arc_credits");
            int index = 0;

            while (stories.has(index))
            {
                JsonNode storyArc = stories.get(index++);
                comic.addStoryArc(storyArc.get("name").asText());
            }
        }

        // apply teams
        comic.clearTeams();
        if (results.has("team_credits"))
        {
            JsonNode teams = results.get("team_credits");
            int index = 0;

            while (teams.has(index))
            {
                JsonNode team = teams.get(index++);
                comic.addTeam(team.get("name").asText());
            }
        }

        // apply credits
        comic.clearCredits();
        if (results.has("person_credits"))
        {
            JsonNode people = results.get("person_credits");
            int index = 0;

            while (people.has(index))
            {
                JsonNode person = people.get(index++);

                String name = person.get("name").asText();
                StringTokenizer roles = new StringTokenizer(person.get("role").asText(), ",");
                while (roles.hasMoreTokens())
                {
                    String role = roles.nextToken();
                    comic.addCredit(name, role.trim());
                }
            }
        }
    }
}
