
package org.comixed.ui.components;

import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JMenuItem;
import javax.swing.JPopupMenu;
import javax.swing.JTable;
import javax.swing.table.TableCellRenderer;

import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicSelectionModel;
import org.comixed.library.model.ComicTableModel;
import org.comixed.library.model.Page;
import org.comixed.ui.menus.MenuHelper;
import org.comixed.ui.menus.MenuHelper.Menu;
import org.comixed.ui.menus.MenuHelper.MenuType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>ComicDetailsTable</code> shows the details for a selection of comics.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ComicDetailsTable extends JTable implements
                               InitializingBean
{
    private static final long serialVersionUID = -4512908003749212065L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicTableModel comicTableModel;
    @Autowired
    private ComicSelectionModel comicSelectionModel;
    @Autowired
    private MenuHelper menuHelper;
    @Autowired
    private TableCellPageRenderer pageRenderer;
    @Autowired
    private MessageSource messageSource;

    private List<Menu> menu = new ArrayList<>();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("Connecting comic table to underlying model");
        this.setModel(this.comicTableModel);
        this.logger.debug("Subscribing selection model to table view updates");
        this.getSelectionModel().addListSelectionListener(this.comicSelectionModel);
        this.logger.debug("Building comic table view popup menu");
        JPopupMenu popup = new JPopupMenu();

        for (Menu item : this.menu)
        {
            if (item.label == null)
            {
                continue;
            }
            if (item.type == MenuType.SEPARATOR)
            {
                this.logger.debug("Creating menu separator");
                popup.addSeparator();
            }
            else if (item.type == MenuType.ITEM)
            {
                JMenuItem menuItem = this.menuHelper.createMenuItem(item.label, item.bean);
                if (menuItem != null)
                {
                    popup.add(menuItem);
                }
            }
        }

        this.setComponentPopupMenu(popup);
    }

    @Override
    public TableCellRenderer getCellRenderer(int row, int column)
    {
        Object obj = this.getValueAt(row, column);
        Class<?> clazz = obj != null ? obj.getClass() : null;

        if (clazz == Page.class) return this.pageRenderer;
        else return super.getCellRenderer(row, column);
    }

    public List<Menu> getMenu()
    {
        return this.menu;
    }

    @Override
    public String getToolTipText(MouseEvent event)
    {
        int row = this.rowAtPoint(event.getPoint());
        this.logger.info("Getting tooltip text: row=" + row);

        if ((row >= 0) && (row < this.comicTableModel.getRowCount()))
        {
            Comic comic = this.comicTableModel.getComicAt(row);
            return this.messageSource.getMessage("view.table.hover_text", new Object[]
            {comic.getDescription(),
             comic.getNotes(),
             comic.getSummary(),
             comic.getFilename()}, this.getLocale());

        }
        else return "No row selected";
    }
}