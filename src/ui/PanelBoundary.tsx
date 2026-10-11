import { Component, type ReactNode } from "react";

/** Menangkap error saat panel (mis. skins 3D) gagal dimuat, supaya layar tidak blank. */
export class PanelBoundary extends Component<{ onBack: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    console.error("Panel gagal dimuat:", err);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#72D4EC] p-6 text-center">
        <div className="font-display text-[6cqw] text-white drop-shadow">Panel belum bisa dibuka</div>
        <div className="font-body text-sm font-bold text-white/90">Coba lagi, atau pastikan perangkat mendukung WebGL.</div>
        <button
          type="button"
          onClick={() => {
            this.setState({ failed: false });
            this.props.onBack();
          }}
          className="rounded-2xl bg-[#2ec4b6] px-8 py-3.5 font-display text-white shadow-[0_5px_0_#1f9a8f]"
        >
          KEMBALI
        </button>
      </div>
    );
  }
}
