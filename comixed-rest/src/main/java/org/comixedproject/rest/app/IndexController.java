package org.comixedproject.rest.app;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class IndexController implements ErrorController {
  private static final String PATH = "/error";

  @RequestMapping(value = PATH)
  public ModelAndView saveLeadQuery() {
    return new ModelAndView("forward:/");
  }
}
