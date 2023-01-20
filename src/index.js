import * as d3 from "d3";

d3.MxGrid = function () {
  let enter = null,
    columns = [],
    data = [],
    selectedKeys = [],
    dataid = null,
    columnid = null;

  function mxGrid(container) {
    function render() {
      maintainCol();
      maintainTh();

      maintainTr();
      maintainTd();
      updateTd();

      function maintainCol() {
        const colgroupSelection = container
          .select("colgroup")
          .selectAll("col")
          .data(
            columns.filter((d) => !d.hidden),
            columnid
          );
        colgroupSelection.exit().remove();
        colgroupSelection.enter().append("col");
        colgroupSelection.style("width", (d) =>
          d.width !== null ? d.width + "px" : undefined
        );
      }
      function maintainTh() {
        const thSelection = container
          .select(".mx-name-head-row")
          .selectAll("th")
          .data(
            columns.filter((d) => !d.hidden),
            columnid
          );
        thSelection.exit().remove();

        let hidden = true;
        thSelection
          .enter()
          .append("th")
          .classed("mx-left-aligned", true)
          .attr("title", (d) => d.caption)
          .html(
            (
              d,
              i
            ) => `<div class="mx-datagrid-sort-icon" style="display: block;">
        <span class="mx-datagrid-sort-text">${d.sort === "desc" ? "▼" : d.sort === "asc" ? "▲" : ""
              }</span>
      </div>
      <div class="mx-datagrid-head-caption">${d.caption}</div>
      ${i > 0 ? '<div class="mx-datagrid-column-resizer">' : ""}</div>`
          )
          .on("click", function (e) {
            hidden = !hidden;
            columns.slice(1, 3).forEach(d => d.hidden = hidden);
            render();
          });
      }

      function maintainTr() {
        const trSelection = container
          .select("tbody")
          .selectAll("tr")
          .data(data, dataid);
        trSelection.exit().remove();
        trSelection
          .enter()
          .append("tr")
          .style("height", "37px") //TODO css
          .classed("selected", (d) => selectedKeys.includes(dataid(d)));
      }

      function maintainTd() {
        container
          .select("tbody")
          .selectAll("tr")
          .each(function (d) {
            const tdSelection = d3
              .select(this)
              .selectAll("td")
              .data(
                columns.filter((d) => !d.hidden),
                columnid
              );
            tdSelection.exit().remove();
            tdSelection
              .enter()
              .append("td")
              .append("div")
              .classed("mx-datagrid-data-wrapper", true);
          });
      }

      function updateTd() {
        container
          .select("tbody")
          .selectAll("tr")
          .each(function (d) {
            const tdSelection = d3
              .select(this)
              .selectAll(".mx-datagrid-data-wrapper")
              .text((column) => d[column.key]);
          });
      }
    }

    render();

    mxGrid.render = render;
  }

  mxGrid.render = function () { };

  mxGrid.data = function (_, __) {
    if (!arguments.length) return data;
    data = _;
    dataid = __;
    return mxGrid;
  };

  mxGrid.dataid = function (_) {
    if (!arguments.length) return dataid;
    dataid = _;
    return mxGrid;
  };

  mxGrid.selected = function (_) {
    if (!arguments.length) return selectedKeys;
    selectedKeys = _;
    return mxGrid;
  };

  mxGrid.columns = function (_, __) {
    if (!arguments.length) return columns;
    columns = _;
    columnid = __;
    return mxGrid;
  };

  return mxGrid;
};

/////////////////////////////////////////////////////////////////////////////////

const mg = d3
  .MxGrid(".mx-grid")
  .data(
    [
      { name: "零件-6.2", other: "other6" },
      { name: "零件-5.2", other: "other5" },
      { name: "零件-4.2", other: "other4" },
      { name: "零件-3.2", other: "other3" },
      { name: "零件-1.2", other: "other1" },
      { name: "零件-2", other: "other2" }
    ].map((d) => ({
      ...d,
      ...{ name1: d.name, name2: d.name, name3: d.name }
    })),
    (d) => d && d.name
  )
  .selected(["零件-3.2", "零件-5.2"])
  .columns(
    [
      { caption: "Group", width: 50 },
      { caption: "Name", hidden: true, key: "name", sort: "asc" },
      { caption: "Name1", hidden: true, key: "name1" },
      { caption: "Name2", hidden: true, key: "name2" },
      { caption: "Name3", hidden: true, key: "name3" },
      { caption: "Other", key: "other", sort: "desc" }
    ],
    function (d) {
      return d && d.caption;
    }
  );

d3.select(".mx-grid").call(mg);

mg.render();
