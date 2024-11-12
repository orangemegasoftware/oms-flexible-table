import React, { useState, useEffect, useRef } from 'react';
import './OmsFlexibleTable.css';

const OmsFlexibleTable  = () => {
  const [table, setTable] = useState([]);
  const [resizeData, setResizeData] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlignment, setTextAlignment] = useState('left');
  const [borderThickness, setBorderThickness] = useState(1);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderColor, setBorderColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const MIN_CELL_SIZE = 20;

  const saveToHistory = (newTable) => {
    setHistory((prevHistory) => [...prevHistory, table]);
    setRedoStack([]);
    setTable(newTable);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prevHistory) => prevHistory.slice(0, -1));
    setRedoStack((prevRedo) => [table, ...prevRedo]);
    setTable(previousState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[0];
    setRedoStack((prevRedo) => prevRedo.slice(1));
    setHistory((prevHistory) => [...prevHistory, table]);
    setTable(nextState);
  };

  const addRow = () => {
    const newRow = Array(table[0]?.length || 1).fill({
      value: '',
      width: 30,
      height: 30,
      styles: {
        textColor: '#000000',
        fontSize: 16,
        isBold: false,
        isItalic: false,
        textAlignment: 'left',
        borderThickness: 1,
        borderStyle: 'solid',
        borderColor: '#000000',
        backgroundColor: '#ffffff',
      },
      merged: false,
      rowSpan: 1,
      colSpan: 1,
    });
    saveToHistory([...table, newRow]);
  };

  const addColumn = () => {
    const newTable = table.map((row) => [
      ...row,
      {
        value: '',
        width: 30,
        height: 30,
        styles: {
          textColor: '#000000',
          fontSize: 16,
          isBold: false,
          isItalic: false,
          textAlignment: 'left',
          borderThickness: 1,
          borderStyle: 'solid',
          borderColor: '#000000',
          backgroundColor: '#ffffff',
        },
        merged: false,
        rowSpan: 1,
        colSpan: 1,
      },
    ]);
    saveToHistory(newTable.length ? newTable : [[{ value: '', width: 30, height: 30, styles: {} }]]);
  };

  const deleteRow = (rowIndex) => {
    const newTable = table.filter((_, index) => index !== rowIndex);
    saveToHistory(newTable);
  };

  const deleteColumn = (colIndex) => {
    const newTable = table.map((row) => row.filter((_, index) => index !== colIndex));
    saveToHistory(newTable[0]?.length ? newTable : []);
  };

  const startResize = (e, rowIndex, colIndex, direction) => {
    e.preventDefault();
    setResizeData({
      startX: e.clientX,
      startY: e.clientY,
      rowIndex,
      colIndex,
      direction,
      initialWidth: table[rowIndex][colIndex].width,
      initialHeight: table[rowIndex][colIndex].height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeData) return;
      const { startX, rowIndex, colIndex, direction, initialWidth } = resizeData;
      const updatedTable = [...table];

      if (direction === 'horizontal') {
        const newWidth = Math.max(MIN_CELL_SIZE, initialWidth + (e.clientX - startX));
        updatedTable[rowIndex][colIndex] = { ...updatedTable[rowIndex][colIndex], width: newWidth };
      }
      setTable(updatedTable);
    };

    const handleMouseUp = () => setResizeData(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeData, table]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        selectAllCells();
      }
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [history, redoStack, table]);

  const selectAllCells = () => {
    const allCells = [];
    table.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        allCells.push(`${rowIndex}-${colIndex}`);
      });
    });
    setSelectedCells(allCells);
  };

  const handleCellClick = (rowIndex, colIndex, event) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    if (event.ctrlKey) {
      setSelectedCells((prevSelected) =>
        prevSelected.includes(cellKey)
          ? prevSelected.filter((cell) => cell !== cellKey)
          : [...prevSelected, cellKey]
      );
    } else {
      setSelectedCells([cellKey]);
    }

    const cellStyles = table[rowIndex][colIndex].styles;
    setTextColor(cellStyles.textColor || '#000000');
    setFontSize(cellStyles.fontSize || 16);
    setIsBold(cellStyles.isBold || false);
    setIsItalic(cellStyles.isItalic || false);
    setTextAlignment(cellStyles.textAlignment || 'left');
    setBorderThickness(cellStyles.borderThickness || 1);
    setBorderStyle(cellStyles.borderStyle || 'solid');
    setBorderColor(cellStyles.borderColor || '#000000');
    setBackgroundColor(cellStyles.backgroundColor || '#ffffff');
  };

  const updateCellStyle = (styleKey, value) => {
    const updatedTable = [...table];
    selectedCells.forEach((cellKey) => {
      const [rowIndex, colIndex] = cellKey.split('-').map(Number);
      updatedTable[rowIndex][colIndex] = {
        ...updatedTable[rowIndex][colIndex],
        styles: {
          ...updatedTable[rowIndex][colIndex].styles,
          [styleKey]: value,
        },
      };
    });
    saveToHistory(updatedTable);
  };

  const handleStyleChange = (styleKey, value, setter) => {
    setter(value);
    updateCellStyle(styleKey, value);
  };

  const handleBlur = (e, rowIndex, colIndex) => {
    const newTable = [...table];
    newTable[rowIndex][colIndex].value = e.target.innerText;
    saveToHistory(newTable);
  };

  const mergeCells = () => {
    if (selectedCells.length < 2) return;
    const rows = selectedCells.map((cell) => parseInt(cell.split('-')[0], 10));
    const cols = selectedCells.map((cell) => parseInt(cell.split('-')[1], 10));
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;
    const updatedTable = [...table];

    updatedTable[minRow][minCol] = {
      ...updatedTable[minRow][minCol],
      rowSpan,
      colSpan,
      merged: true,
      value: updatedTable[minRow][minCol].value || '',
    };

    selectedCells.forEach((cell) => {
      const [rowIndex, colIndex] = cell.split('-').map(Number);
      if (rowIndex !== minRow || colIndex !== minCol) {
        updatedTable[rowIndex][colIndex] = { ...updatedTable[rowIndex][colIndex], merged: true, hidden: true };
      }
    });

    saveToHistory(updatedTable);
    setSelectedCells([`${minRow}-${minCol}`]);
  };

  const unmergeCells = () => {
    if (selectedCells.length !== 1) return;
    const [rowIndex, colIndex] = selectedCells[0].split('-').map(Number);
    const cell = table[rowIndex][colIndex];
    if (!cell.merged) return;

    const updatedTable = [...table];
    for (let r = rowIndex; r < rowIndex + cell.rowSpan; r++) {
      for (let c = colIndex; c < colIndex + cell.colSpan; c++) {
        updatedTable[r][c] = {
          ...updatedTable[r][c],
          merged: false,
          hidden: false,
          rowSpan: 1,
          colSpan: 1,
        };
      }
    }

    saveToHistory(updatedTable);
    setSelectedCells([]);
  };

  return (
    <div className="container">
      <div className="table-editor">
        <h2 className="title">Custom Table Editor</h2>

        <div className="button-group">
          <button onClick={addRow} className="button button-blue">Add Row</button>
          <button onClick={addColumn} className="button button-green">Add Column</button>
          <button onClick={mergeCells} className="button button-purple">Merge Cells</button>
          <button onClick={unmergeCells} className="button button-red">Unmerge Cells</button>
          <button onClick={handleUndo} className="button button-yellow">Undo</button>
          <button onClick={handleRedo} className="button button-orange">Redo</button>
        </div>

        <div className="control-group">
          <label className="input-label">
            <span>Text Color:</span>
            <input type="color" value={textColor} onChange={(e) => handleStyleChange('textColor', e.target.value, setTextColor)} />
          </label>
          <label className="input-label">
            <span>Font Size:</span>
            <input type="number" value={fontSize} onChange={(e) => handleStyleChange('fontSize', Number(e.target.value), setFontSize)} min="10" max="36" />
          </label>
          <button onClick={() => handleStyleChange('isBold', !isBold, setIsBold)} className={`button ${isBold ? 'button-active' : ''}`}>B</button>
          <button onClick={() => handleStyleChange('isItalic', !isItalic, setIsItalic)} className={`button ${isItalic ? 'button-active' : ''}`}>I</button>
          <label className="input-label">
            <span>Text Alignment:</span>
            <select value={textAlignment} onChange={(e) => handleStyleChange('textAlignment', e.target.value, setTextAlignment)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="input-label">
            <span>Border Thickness:</span>
            <input type="number" value={borderThickness} onChange={(e) => handleStyleChange('borderThickness', Number(e.target.value), setBorderThickness)} min="1" max="10" />
          </label>
          <label className="input-label">
            <span>Border Style:</span>
            <select value={borderStyle} onChange={(e) => handleStyleChange('borderStyle', e.target.value, setBorderStyle)}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </label>
          <label className="input-label">
            <span>Border Color:</span>
            <input type="color" value={borderColor} onChange={(e) => handleStyleChange('borderColor', e.target.value, setBorderColor)} />
          </label>
          <label className="input-label">
            <span>Background Color:</span>
            <input type="color" value={backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value, setBackgroundColor)} />
          </label>
        </div>

        {table.length > 0 && (
          <div className="table-container">
            <table className="table">
              <tbody>
                {table[0].length > 0 && (
                  <tr>
                    {table[0].map((_, colIndex) => (
                      <td key={colIndex} className="text-center">
                        <button onClick={() => deleteColumn(colIndex)} className="delete-btn">×</button>
                      </td>
                    ))}
                  </tr>
                )}
                {table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => {
                      if (cell.hidden) return null;

                      return (
                        <td
                          key={colIndex}
                          className="cell"
                          style={{
                            width: `${cell.width}px`,
                            color: cell.styles.textColor,
                            fontSize: `${cell.styles.fontSize}px`,
                            textAlign: cell.styles.textAlignment,
                            fontWeight: cell.styles.isBold ? 'bold' : 'normal',
                            fontStyle: cell.styles.isItalic ? 'italic' : 'normal',
                            backgroundColor: cell.styles.backgroundColor,
                            borderWidth: `${cell.styles.borderThickness}px`,
                            borderStyle: cell.styles.borderStyle,
                            borderColor: cell.styles.borderColor,
                          }}
                          onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                          rowSpan={cell.rowSpan}
                          colSpan={cell.colSpan}
                        >
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleBlur(e, rowIndex, colIndex)}
                            className="cell-content"
                            style={{ minHeight: `${cell.height}px` }}
                          >
                            {cell.value}
                          </div>
                          <div onMouseDown={(e) => startResize(e, rowIndex, colIndex, 'horizontal')} className="resize-handle" />
                        </td>
                      );
                    })}
                    <td className="text-center">
                      <button onClick={() => deleteRow(rowIndex)} className="delete-btn">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OmsFlexibleTable ;
