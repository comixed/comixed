package org.comixedproject;

import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.TestPropertySource;

@Configuration
@TestPropertySource("classpath:application.properties")
public class ComiXedTestContext {}
