const testCaseSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.ObjectId,
    ref: 'Problem',
    required: true
  },
  input: {
    type: String, // Or S3 URL for large inputs
    required: true
  },
  expectedOutput: {
    type: String, // Or S3 URL for large outputs
    required: true
  },
  isPublic: {
    // If true, visible to user (e.g. sample cases)
    type: Boolean,
    default: false
  },
  order: Number
});

const TestCase = mongoose.model('TestCase', testCaseSchema);
module.exports = TestCase;
