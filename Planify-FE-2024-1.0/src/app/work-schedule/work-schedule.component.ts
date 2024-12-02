import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkScheduleService } from './work-schedule.service';
import { Block } from './Block';
import { ScheduleConfirmDialogComponent } from './schedule-confirm-dialog/schedule-confirm-dialog.component';
import { MatDialog, MatDialogModule} from '@angular/material/dialog';
import { InspectAdminService } from '../inspect-admin/inspect-admin.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-work-schedule',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, SidebarComponent],
  templateUrl: './work-schedule.component.html',
  styleUrl: './work-schedule.component.css',
})
export class WorkScheduleComponent {

  blocks: Block[] = [];

  isClicked = false;
  scheduleRegistered = false;

  constructor(
    private readonly workScheduleService: WorkScheduleService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly inspectServices: InspectAdminService
  ) {}

  ngOnInit() {
    // Llamada al servicio para comprobar si ya hay horarios
    this.workScheduleService.getWorkSchedule().subscribe(
      (data: any) => {
        this.blocks = data.map((block: Block) => ({
          blockName: block.blockName,
          startHour: block.startHour,
          endHour: block.endHour,
        }));
        if (this.blocks.length === 0) {
          this.blocks.push(new Block('', '', ''));
        } else {
          this.scheduleRegistered = true;
        }
      },
    );
  }

  addBlock() {
    const newblock = new Block('', '', '');
    this.blocks.push(newblock);
    this.verifyFields(); // Verificar si todos los campos están completos al añadir un nuevo bloque
  }

  removeBlock() {
    this.blocks.pop();
  }

  verifyFields() {
    this.isClicked = this.blocks.every(
      (block: Block) =>
        block.blockName !== '' && block.startHour !== '' && block.endHour !== ''
    );
  }
  // Valida el bloque al cambiar una hora
  validateBlock(index: number) {
    const block: Block = this.blocks[index];

    // Verifica que el "hasta" sea mayor que el "desde" del mismo bloque
    if (block.endHour && block.startHour && block.endHour < block.startHour) {
      this.dialog.open(ScheduleConfirmDialogComponent, {
        data: {
          error: true,
          message:
            'La hora de fin de este bloque no puede ser anterior a la hora del inicio.',
        },
      });

      if (this.isClicked) {
        this.isClicked = false;
      }
      block.endHour = ''; // Restablece el valor para corregirlo
    }

    // Si hay un bloque anterior, verifica que el "desde" del bloque actual sea mayor que el "hasta" del bloque anterior
    if (index > 0) {
      const previousBlock: Block = this.blocks[index - 1];
      if (block.startHour < previousBlock.endHour) {
        this.dialog.open(ScheduleConfirmDialogComponent, {
          data: {
            error: true,
            message:
              'La hora de inicio de este bloque no puede ser anterior a la hora de fin del anterior bloque.',
          },
        });
        block.startHour = previousBlock.endHour; // Ajusta el valor automáticamente
      }

      if (block.blockName === previousBlock.blockName) {
        this.dialog.open(ScheduleConfirmDialogComponent, {
          data: {
            error: true,
            message:
              'El nombre de este bloque no puede ser igual al nombre del bloque anterior',
          },
        });
        block.blockName = ''; // Restablece el valor para corregirlo
      }
    }
  }

  openConfirmDialog() {
    const dialogRef = this.dialog.open(ScheduleConfirmDialogComponent, {
      data: {
        error: false,
        message:
          'Esta acción solo se podrá realizar una única vez y es irreversible.',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.confirmSchedule(); // Ejecuta la acción si el usuario confirma
      }
    });
  }

  confirmSchedule() {
    this.workScheduleService.addWorkSchedule(this.blocks).subscribe(
      (result) => {
        window.location.reload();
      },
      (error) => {
      }
    );
  }

}
