/* eslint-disable @typescript-eslint/no-require-imports */
const Sequencer = require('@jest/test-sequencer').default

class CustomSequencer extends Sequencer {
  shard(tests, { shardIndex, shardCount }) {
    const shardSize = Math.ceil(tests.length / shardCount)
    const shardStart = shardSize * (shardIndex - 1)
    const shardEnd = shardSize * shardIndex

    return [...tests].sort((a, b) => (a.path > b.path ? 1 : -1)).slice(shardStart, shardEnd)
  }

  sort(tests) {
    const copyTests = [...tests]
    return copyTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1))
  }
}

module.exports = CustomSequencer
