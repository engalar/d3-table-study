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
      function updateCol() {
        const colgroupSelection = container
          .select("colgroup")
          .selectAll("col")
          .data(columns, columnid);
        colgroupSelection.exit().remove();
        colgroupSelection.enter().append("col");
        colgroupSelection.style('width', d => d.width ? d.width + 'px' : undefined);
      }
      updateCol();

      const thSelection = container
        .select(".mx-name-head-row")
        .selectAll("th")
        .data(columns, columnid);
      thSelection.exit().remove();

      thSelection
        .enter()
        .append("th")
        .classed("mx-left-aligned", true)
        .attr("title", (d) => d.caption)
        .html(
          (d, i) => `<div class="mx-datagrid-sort-icon" style="display: block;">
        <span class="mx-datagrid-sort-text">▲</span>
      </div>
      <div class="mx-datagrid-head-caption">${d.caption}</div>
      ${i > 0 ? '<div class="mx-datagrid-column-resizer">' : ""}</div>`
        );

      //drag resize col
      let lastX, delta, lastWidths2, columnIndx;
      container
        .select(".mx-name-head-row")
        .selectAll(".mx-datagrid-column-resizer")
        .call(
          d3
            .drag()
            .container(function () {
              return this.parentElement.parentElement;
            })
            .on("drag", function (e) {
              delta = e.x - lastX;
              columns[columnIndx].width = lastWidths2[columnIndx] + delta;
              container
                .select("colgroup")
                // .selectAll("col").nodes()[columnIndx].style.width = `${lastWidths2[columnIndx] + delta}px`
                updateCol();
            })
            .on("start", function (e) {
              lastX = e.x;
              lastWidths2 = container
                .select("colgroup")
                .selectAll("col")
                .nodes()
                .map((d) => d.clientWidth);

              columnIndx = columns.indexOf(e.sourceEvent.target.parentElement.__data__) - 1;

              d3.select("#debug").html(JSON.stringify(lastWidths2));
            })
            .on("end", function (e) {
              console.log("end", e);
              // e.sourceEvent.preventDefault();
              //debugger;
            })
        );

      async function animation() {
        const lastWidths = container
          .select("colgroup")
          .selectAll("col")
          .nodes()
          .map((d) => d.clientWidth);

        const avgWidth =
          container.select("colgroup").node().clientWidth / columns.length;



        //更新列宽
        await container
          .select("colgroup")
          .selectAll("col")
          .style("width", function (d, i) {
            return lastWidths[i] + "px";
          })
          .transition()
          .style("width", function (d, i) {
            //return lastWidths[i] + "px";
            return avgWidth + "px";
          })
          .duration(800)
          .ease(d3.easeBounce)
          .end();
      }

      /*       animation()
              .then(updateCellText)
              .catch(console.log); */
      updateCellText();

      const trSelection = container
        .select("tbody")
        .selectAll("tr")
        .data(data, dataid);
      trSelection.exit().remove();
      trSelection
        .enter()
        .append("tr")
        .style('height', '37px')//TODO css
        .classed("selected", (d) => selectedKeys.includes(dataid(d)));

      //更新行内td
      container
        .select("tbody")
        .selectAll("tr")
        .each(function (d) {
          const tdSelection = d3
            .select(this)
            .selectAll("td")
            .data(columns, columnid);
          tdSelection.exit().remove();
          tdSelection
            .enter()
            .append("td")
            .append("div")
            .classed("mx-datagrid-data-wrapper", true);
        });

      function updateCellText() {
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
    ],
    (d) => d && d.name
  )
  .selected(["零件-3.2", "零件-5.2"])
  .columns(
    [
      { caption: "Name", key: "name", width: 20 },
      { caption: "Other", key: "other" }
    ],
    function (d) {
      return d && d.caption;
    }
  );

d3.select(".mx-grid").call(mg);

mg.render();

// 动态调整列数量
d3.select("#mxui_widget_ControlBarButton_0").on("click", function () {
  mg.columns(
    [
      { caption: "Name", key: "name" },
      { caption: "Name1", key: "name1" },
      { caption: "Name2", key: "name2" },
      { caption: "Name3", key: "name3" },
      { caption: "Other", key: "other" }
    ],
    function (d) {
      return d && d.caption;
    }
  )
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
    .render();
});
