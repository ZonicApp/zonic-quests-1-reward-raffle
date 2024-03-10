function buildWeightSumArray(ids, weights) {
  let sum = 0;
  const result = []
  for (let i = 0; i < weights.length; i++) {
    sum += Number(weights[i])
    result.push(sum)
  }
  return result
}

function pickIndex(weightSumArr, pickedWeight) {
  let rand = Number(pickedWeight % BigInt(weightSumArr[weightSumArr.length - 1]))
  let left = 0, right = weightSumArr.length - 1
  while (left < right) {
    let mid = Math.floor((left + right) / 2)
    if (weightSumArr[mid] <= rand)
      left = mid + 1
    else
      right = mid
  }
  return left
}

function pickIndexTraditional(weightSumArr, pickedWeight) {
  let weightSum = weightSumArr.reduce((acc, val) => acc += val, 0)
  let rand = Number(pickedWeight % BigInt(weightSum))
  for (let i = 0; i < weightSumArr.length; i++) {
    rand -= weightSumArr[i]
    if (rand < 0)
      return i
  }
}

module.exports.buildWeightSumArray = buildWeightSumArray
module.exports.pickIndex = pickIndex
module.exports.pickIndexTraditional = pickIndexTraditional
