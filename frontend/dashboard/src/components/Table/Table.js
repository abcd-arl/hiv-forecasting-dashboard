import { useState, useEffect, useRef, useReducer } from "react";
import Cell from "../Cell/Cell";

function getTableLastIndex(tableValues) {
  return [
    tableValues.length - 1,
    tableValues[tableValues.length - 1].length - 1,
  ];
}

const reducer = (state, action) => {
  const numColPerRow = 4;

  switch (action.type) {
    case "initialize":
      return {
        values: [
          [2010, 1, 2, 3],
          [2011, 4, 5, 6],
          [2011, 7, 8, 9],
        ],
        activity: {
          status: "initialized",
          startIndex: [0, 0],
        },
      };

    case "add":
      const tableValues = JSON.parse(JSON.stringify(state.values));

      let numOfCellsToAdd = action.numOfCellsToAdd;
      while (numOfCellsToAdd) {
        const [lastRow, lastCol] = getTableLastIndex(tableValues);

        if (lastCol <= numColPerRow) tableValues[lastRow].push("");
        else tableValues.push([""]);

        numOfCellsToAdd = numOfCellsToAdd - 1;
      }

      return {
        values: tableValues,
        activity: {
          status: "editing",
          startIndex: getTableLastIndex(state.values),
        },
      };

    default:
      return state;
  }
};

export default function Table() {
  const defValLastIndex = useRef(null);
  const [table, dispatch] = useReducer(reducer, {
    values: [],
    activity: {
      status: "standby",
      startIndex: [],
    },
  });

  useEffect(() => {
    dispatch({ type: "initialize" });
    defValLastIndex.current = getTableLastIndex(table.values);
  }, []);

  const tableRows = (() => {
    const [lastRow, lastCol] = getTableLastIndex(table.values);
    const [defValueLastRow, defValueLastCol] = defValLastIndex.current;
    const rows = [];
    for (let i = 0; i <= lastRow; i++) {
      const cols = [];
      for (let j = 0; j <= lastCol; j++) {
        if (i <= defValueLastRow && j <= defValueLastCol) {
          cols.push(
            <Cell
              initialValue={table.values[i][j]}
              cellStatus={"default"}
              tableStatus={table.activity.status}
            />
          );
        }
      }
      rows.push(<tr>{cols}</tr>);
    }
    return rows;
  })();

  return (
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Month1</th>
          <th>Month2</th>
          <th>Month3</th>
        </tr>
      </thead>
      <tbody>{tableRows}</tbody>
    </table>
  );
}
