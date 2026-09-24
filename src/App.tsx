import { useState } from 'react';
import { DeviationNotice } from './components/DeviationNotice';
import { Disclaimer } from './components/Disclaimer';
import { Notice } from './components/Notice';
import { PhotoPicker } from './components/PhotoPicker';
import { PhotoStage } from './components/PhotoStage';
import { PhotoStrip } from './components/PhotoStrip';
import { Processing } from './components/Processing';
import { RecentNotes } from './components/RecentNotes';
import { ResultCard } from './components/ResultCard';
import { SaveColorPanel } from './components/SaveColorPanel';
import { SavedColorsView } from './components/SavedColorsView';
import { TopBar, type TopBarMode } from './components/TopBar';
import { Welcome } from './components/Welcome';
import { RECIPIENT_NAME } from './config';
import { buildGreeting } from './domain/greeting';
import { MAX_NOTE_LENGTH } from './domain/savedColor';
import { MAX_PHOTOS, useColorSession } from './hooks/useColorSession';
import { useSavedColors } from './hooks/useSavedColors';
import { useShareColor } from './hooks/useShareColor';
import styles from './App.module.css';

type View = 'home' | 'notes';

const RECENT_NOTES_COUNT = 3;

export function App() {
  const session = useColorSession();
  const savedColors = useSavedColors();
  const { share, message: shareMessage } = useShareColor();
  const [view, setView] = useState<View>('home');
  const { activePhoto, report } = session;

  const hasResult = activePhoto !== null && report !== null;
  const isProcessing = session.isLoading && !hasResult;
  const mode: TopBarMode = view === 'notes' ? 'notes' : hasResult ? 'result' : 'welcome';

  const handleFiles = (files: File[]) => {
    setView('home');
    void session.addFiles(files);
  };

  const picker = (variant: 'hero' | 'bar') => (
    <PhotoPicker
      variant={variant}
      onFiles={handleFiles}
      isLoading={session.isLoading}
      canAddMore={session.canAddMore}
      maxPhotos={MAX_PHOTOS}
    />
  );

  return (
    <div className={styles.app}>
      <div className={styles.page}>
        <TopBar
          mode={mode}
          greeting={buildGreeting(RECIPIENT_NAME)}
          savedCount={savedColors.saved.length}
          onOpenNotes={() => setView('notes')}
          onBack={mode === 'notes' ? () => setView('home') : session.reset}
        />

        <main className={styles.main}>
          {view === 'notes' ? (
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
                    onShare={() => share({ name: report.name, hex: report.hex, tone: report.tone, note: '' })}
                    shareMessage={shareMessage}
                    actions={
                      <>
                        {savedColors.error && <Notice variant="error">{savedColors.error}</Notice>}
                        <SaveColorPanel
                          key={`${report.hex}-${report.name}`}
                          maxNoteLength={MAX_NOTE_LENGTH}
                          onSave={(note) =>
                            savedColors.save({ name: report.name, hex: report.hex, tone: report.tone, note })
                          }
                          onOpenSaved={() => setView('notes')}
                        />
                      </>
                    }
                  />
                  <Disclaimer />
                </>
              ) : isProcessing ? (
                <Processing />
              ) : (
                <Welcome
                  footer={
                    <RecentNotes colors={savedColors.saved.slice(0, RECENT_NOTES_COUNT)} onOpen={() => setView('notes')} />
                  }
                >
                  {picker('hero')}
                </Welcome>
              )}
            </>
          )}
        </main>
      </div>

      {view === 'home' && hasResult && picker('bar')}
    </div>
  );
}
