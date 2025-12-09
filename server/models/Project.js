const mongoose = require("mongoose");

const { Schema } = mongoose;

const BlockSchema = new Schema(
  {
    type: { type: String, required: true }, // 블록 유형 (channel, revenue, cost 등)
    position: {
      x: { type: Number, required: true, default: 0 },
      y: { type: Number, required: true, default: 0 },
    },
    properties: { type: Schema.Types.Mixed, default: {} }, // 블록 속성(유연한 구조)
    connections: [{ type: String }], // 연결된 블록 ID 리스트 (유연성을 위해 string)
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    userId: { type: String, required: true },
    blocks: { type: [BlockSchema], default: [] },
    // 캔버스 연결선 데이터(유연한 구조를 위해 Mixed)
    connections: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Project", ProjectSchema);
