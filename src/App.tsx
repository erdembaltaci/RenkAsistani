import { AppHeader } from './components/AppHeader';
import { DeviationNotice } from './components/DeviationNotice';
import { Disclaimer } from './components/Disclaimer';
import { EmptyState } from './components/EmptyState';
import { Notice } from './components/Notice';
import { PhotoPicker } from './components/PhotoPicker';
import { PhotoStage } from './components/PhotoStage';
import { PhotoStrip } from './components/PhotoStrip';
import { ResultCard } from './components/ResultCard';
import { MAX_PHOTOS, useColorSession } from './hooks/useColorSession';
import styles from './App.module.css';

export function App() {
  const session = useColorSession();
  const { activePhoto, report } = session;

  return (
    <div className={styles.app}>
      <div className={styles.page}>
        <AppHeader />
        <main className={styles.main}>
          {session.error && <Notice variant="error">{session.error}</Notice>}

          {activePhoto && report ? (
            <>
              <PhotoStage
                key={activePhoto.id}
                photo={activePhoto}
                onPick={(point) => session.setFocus(activePhoto.id, point)}
                onAuto={() => session.setFocus(activePhoto.id, null)}
              />
              {session.photos.length > 1 && (
                <PhotoStrip
                  photos={session.photos}
                  activeId={activePhoto.id}
                  onSelect={session.selectPhoto}
                  onRemove={session.removePhoto}
                />
              )}
              <DeviationNotice kind={report.deviation} />
              <ResultCard report={report} onReset={session.reset} />
            </>
          ) : (
            <EmptyState />
          )}

          <Disclaimer />
        </main>
      </div>
      <PhotoPicker
        onFiles={session.addFiles}
        isLoading={session.isLoading}
        canAddMore={session.canAddMore}
        maxPhotos={MAX_PHOTOS}
      />
    </div>
  );
}
