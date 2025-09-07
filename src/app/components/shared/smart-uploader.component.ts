import { Component, Input, Output, EventEmitter, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type UploadStatus = 'queued' | 'uploading' | 'verifying' | 'processed' | 'error' | 'cancelled';

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number; // 0-100
  attempts: number;
  errorMessage?: string;
}

@Component({
  selector: 'app-smart-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="uploader">
      <div 
        class="dropzone"
        [class.dropzone-active]="isDragging"
        (click)="fileInput?.click()"
        role="button"
        tabindex="0"
        (keydown.enter)="fileInput?.click()"
        (keydown.space)="fileInput?.click()"
        aria-label="Subir documentos"
      >
        <p>Arrastra y suelta archivos aquí o haz clic para seleccionar</p>
        <input 
          #fileInput
          type="file" 
          [attr.accept]="accept || null"
          [attr.multiple]="maxFiles !== 1 ? '' : null"
          (change)="onFileInputChange($event)"
          hidden
        />
      </div>

      <div class="queue" *ngIf="queue().length > 0">
        <h3 class="queue-title">Cola de carga ({{ queue().length }})</h3>
        <ul class="queue-list">
          <li *ngFor="let item of queue()" class="queue-item">
            <div class="file-meta">
              <span class="file-name">{{ item.name }}</span>
              <span class="file-size">{{ formatSize(item.size) }}</span>
            </div>
            <div class="progress-row">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="item.progress"></div>
              </div>
              <span class="status">{{ item.status }}</span>
            </div>
            <div class="actions">
              <button type="button" (click)="removeItem(item.id)">Eliminar</button>
              <button type="button" (click)="retryItem(item.id)" *ngIf="item.status==='error'">Reintentar</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .uploader { display: grid; gap: 16px; }
    .dropzone { border: 2px dashed #374151; border-radius: 8px; padding: 24px; text-align: center; color: #9ca3af; cursor: pointer; }
    .dropzone.dropzone-active { border-color: #10b981; color: #e5e7eb; background: #0b1220; }
    .queue-title { margin: 0; font-size: 14px; color: #9ca3af; }
    .queue-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
    .queue-item { border: 1px solid #374151; border-radius: 8px; padding: 12px; display: grid; gap: 8px; }
    .file-meta { display: flex; justify-content: space-between; color: #e5e7eb; }
    .file-name { font-weight: 600; }
    .file-size { color: #9ca3af; }
    .progress-row { display: flex; align-items: center; gap: 8px; }
    .progress-bar { flex: 1; height: 8px; background: #1f2937; border-radius: 8px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width .2s; }
    .status { color: #9ca3af; font-size: 12px; min-width: 88px; text-align: right; }
    .actions { display: flex; gap: 8px; }
    .actions button { background: #374151; color: #e5e7eb; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .actions button:hover { background: #4b5563; }
  `]
})
export class SmartUploaderComponent {
  @Input() accept: string = '';
  @Input() maxFiles: number = 10;
  @Input() maxSizeBytes: number = 25 * 1024 * 1024; // 25 MB
  @Input() disabled: boolean = false;

  @Output() filesAdded = new EventEmitter<UploadItem[]>();
  @Output() fileRemoved = new EventEmitter<string>();
  @Output() queueChanged = new EventEmitter<UploadItem[]>();

  isDragging = false;
  queue = signal<UploadItem[]>([]);

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    if (this.disabled) return;
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (this.disabled) return;
    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.addFiles(files);
    input.value = '';
  }

  addFiles(files: File[]): void {
    if (files.length === 0) return;
    const current = this.queue();
    const availableSlots = Math.max(0, this.maxFiles - current.length);
    const toAdd = files.slice(0, availableSlots)
      .filter(f => f.size <= this.maxSizeBytes)
      .filter(f => !current.some(i => i.name === f.name && i.size === f.size));

    const newItems: UploadItem[] = toAdd.map(f => ({
      id: this.generateId(),
      file: f,
      name: f.name,
      size: f.size,
      status: 'queued',
      progress: 0,
      attempts: 0,
    }));

    const updated = [...current, ...newItems];
    this.queue.set(updated);
    this.filesAdded.emit(newItems);
    this.queueChanged.emit(updated);

    // Simulate progress for demo; real upload will replace this
    newItems.forEach(item => this.simulateUpload(item.id));
  }

  removeItem(id: string): void {
    const updated = this.queue().filter(i => i.id !== id);
    this.queue.set(updated);
    this.fileRemoved.emit(id);
    this.queueChanged.emit(updated);
  }

  retryItem(id: string): void {
    const item = this.queue().find(i => i.id === id);
    if (!item) return;
    item.status = 'queued';
    item.progress = 0;
    item.errorMessage = undefined;
    item.attempts += 1;
    this.queue.set([...this.queue()]);
    this.simulateUpload(id);
  }

  private simulateUpload(id: string): void {
    const item = this.queue().find(i => i.id === id);
    if (!item) return;
    item.status = 'uploading';
    item.progress = 0;
    this.queue.set([...this.queue()]);

    const interval = setInterval(() => {
      const currentItem = this.queue().find(i => i.id === id);
      if (!currentItem) { clearInterval(interval); return; }
      currentItem.progress = Math.min(currentItem.progress + 10, 100);
      if (currentItem.progress >= 100) {
        currentItem.status = 'processed';
        clearInterval(interval);
      }
      this.queue.set([...this.queue()]);
    }, 200);
  }

  private generateId(): string {
    const random = globalThis.crypto && 'getRandomValues' in globalThis.crypto
      ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')
      : Math.random().toString(16).slice(2) + Date.now().toString(16);
    return `upl_${random}`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}

