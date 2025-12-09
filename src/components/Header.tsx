import React from "react";
import { Play, Save, Download } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  nodeCount: number;
  connectionCount: number;
  onRunDiagnostics: () => void;
  onSave: () => void;
}

export function Header({
  nodeCount,
  connectionCount,
  onRunDiagnostics,
  onSave,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Biz-Architect</h1>
        <span className={styles.subtitle}>비즈니스 구조 엔지니어링 플랫폼</span>
      </div>

      <div className={styles.right}>
        <div className={styles.stats}>
          <span>{nodeCount} 블록</span>
          <span>{connectionCount} 연결</span>
        </div>

        <div className={styles.actions}>
          <button onClick={onRunDiagnostics} className={styles.primaryButton}>
            <Play className="w-4 h-4" /> {/* keep icon sizing consistent */}
            진단 실행
          </button>

          <button className={styles.iconButton} onClick={onSave}>
            <Save className="w-4 h-4" />
          </button>

          <button className={styles.iconButton}>
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
