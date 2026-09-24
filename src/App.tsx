import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { DeviationNotice } from './components/DeviationNotice';
import { Disclaimer } from './components/Disclaimer';
import { EmptyState } from './components/EmptyState';
import { Notice } from './components/Notice';
import { PhotoPicker } from './components/PhotoPicker';
import { PhotoStage } from './components/PhotoStage';
import { PhotoStrip } from './components/PhotoStrip';
import { ResultCard } from './components/ResultCard';
import { SaveColorPanel } from './components/SaveColorPanel';
import { SavedColorsView } from './components/SavedColorsView';
import { RECIPIENT_NAME } from './config';
import { buildGreeting } from './domain/greeting';
import { MAX_NOTE_LENGTH } from './domain/savedColor';
import { MAX_PHOTOS, useColorSession } from './hooks/useColorSession';
import { useSavedColors } from './hooks/useSavedColors';
import styles from './App.module.css';

type View = 'home' | 'saved';

export function App() {
  const session = useColorSession();
  const savedColors = useSavedColors();
  const [view, setView] = useState<View>('home');
  const { activePhoto, report } = session;

  const showHome = () => setView('home');
  const handleFiles = (files: File[]) => {
    showHome();
    void session.addFiles(files);
  };

  return (
    <div className={styles.app}>
      <div className={styles.page}>
        <AppHeader
          greeting={buildGreeting(RECIPIENT_NAME)}
          savedCount={savedColors.saved.length}
          isSavedViewOpen={view === 'saved'}
          onToggleSaved={() => setView(view === 'saved' ? 'home' : 'saved')}
        />
        <main className={styles.main}>
          {view === 'saved' ? (
            <SavedColorsView
              colors={savedColors.saved}
              listText={savedColors.listText}
              isPersistent={savedColors.isPersistent}
              error={savedColors.error}
              onUpdateNote={savedColors.updateNote}
              onRemove={savedColors.remove}
            />
          ) : (
            <>
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
                  <ResultCard
                    report={report}
                    onReset={session.reset}
                    actions={
                      <>
                        {savedColors.error && <Notice variant="error">{savedColors.error}</Notice>}
                        <SaveColorPanel
                          key={`${report.hex}-${report.name}`}
                          maxNoteLength={MAX_NOTE_LENGTH}
                          onSave={(note) =>
                            savedColors.save({ name: report.name, hex: report.hex, tone: report.tone, note })
                          }
                          onOpenSaved={() => setView('saved')}
                        />
                      </>
                    }
                  />
                </>
              ) : (
                <EmptyState />
              )}

              <Disclaimer />
            </>
          )}
        </main>
      </div>
      <PhotoPicker
        onFiles={handleFiles}
        isLoading={session.isLoading}
        canAddMore={session.canAddMore}
        maxPhotos={MAX_PHOTOS}
      />
    </div>
  );
}
