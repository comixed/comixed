/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.dbtool.commands;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class UnlockDatabaseCommandTest {
  @InjectMocks private UnlockDatabaseCommand command;
  @Mock private DataSource dataSource;
  @Mock private Connection connection;
  @Mock private Statement statement;

  @Before
  public void setUp() throws SQLException {
    Mockito.when(dataSource.getConnection()).thenReturn(connection);
    Mockito.when(connection.createStatement()).thenReturn(statement);
  }

  @Test(expected = DatabaseCommandException.class)
  public void testExecuteExceptionGettingConnection()
      throws DatabaseCommandException, SQLException {
    Mockito.when(dataSource.getConnection()).thenThrow(SQLException.class);

    try {
      command.execute();
    } finally {
      Mockito.verify(dataSource, Mockito.times(1)).getConnection();
    }
  }

  @Test(expected = DatabaseCommandException.class)
  public void testExecuteExceptionCreatingStatement()
      throws DatabaseCommandException, SQLException {
    Mockito.when(connection.createStatement()).thenThrow(SQLException.class);

    try {
      command.execute();
    } finally {
      Mockito.verify(dataSource, Mockito.times(1)).getConnection();
      Mockito.verify(connection, Mockito.times(1)).createStatement();
    }
  }

  @Test(expected = DatabaseCommandException.class)
  public void testExecuteExceptionExecutingStatement()
      throws DatabaseCommandException, SQLException {
    Mockito.when(statement.executeUpdate(Mockito.anyString())).thenThrow(SQLException.class);

    try {
      command.execute();
    } finally {
      Mockito.verify(dataSource, Mockito.times(1)).getConnection();
      Mockito.verify(connection, Mockito.times(1)).createStatement();
      Mockito.verify(statement, Mockito.times(1)).executeUpdate(Mockito.anyString());
    }
  }

  @Test
  public void testExecuteUpdatesRecord() throws DatabaseCommandException, SQLException {
    Mockito.when(statement.executeUpdate(Mockito.anyString())).thenReturn(1);

    command.execute();

    Mockito.verify(dataSource, Mockito.times(1)).getConnection();
    Mockito.verify(connection, Mockito.times(1)).createStatement();
    Mockito.verify(statement, Mockito.times(1)).executeUpdate(Mockito.anyString());
  }

  @Test
  public void testExecuteUpdatesNothing() throws DatabaseCommandException, SQLException {
    Mockito.when(statement.executeUpdate(Mockito.anyString())).thenReturn(0);

    command.execute();

    Mockito.verify(dataSource, Mockito.times(1)).getConnection();
    Mockito.verify(connection, Mockito.times(1)).createStatement();
    Mockito.verify(statement, Mockito.times(1)).executeUpdate(Mockito.anyString());
  }
}
