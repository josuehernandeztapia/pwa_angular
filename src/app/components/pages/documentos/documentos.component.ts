import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-documentos',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './documentos.component.html',
	styleUrls: ['./documentos.component.scss']
})
export class DocumentosComponent {
	documentos: any[] = [];
	estado = 'Pendiente';
	loading = false;
	selectedFile: File | null = null;

	onFileSelected(event: any) {
		this.selectedFile = event.target?.files?.[0] || null;
	}

	subirDocumento() {
		if (!this.selectedFile) return;
		this.loading = true;
		this.estado = 'Pendiente';
		setTimeout(() => {
			this.loading = false;
			this.estado = 'Validado';
			this.documentos.push({
				nombre: this.selectedFile?.name,
				estado: this.estado,
				fecha: new Date().toLocaleString()
			});
		}, 1500);
	}
}

