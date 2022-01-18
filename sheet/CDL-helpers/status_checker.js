function aresYesOrNo (row, lastRow, activeCel, targetCel) {
  if (row <= lastRow
     && row > 1
     && Number.isFinite(activeCel.getValue()))
  {
    // Set value in target cell to Yes
    targetCel.setValue('Yes');
  } else if (row <= lastRow
     && row > 1
     && !(Number.isFinite(activeCel.getValue())))
  {
    // Set value in target cell in Yes
    targetCel.setValue('No');
  }
}
