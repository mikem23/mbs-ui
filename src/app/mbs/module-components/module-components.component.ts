import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { BaseListComponent } from '../base-components/base-list.component';
import { ModuleService } from '../services/module.service';
import { MbsComponent } from '../models/mbs.type';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-module-components',
  templateUrl: './module-components.component.html',
  styleUrls: ['./module-components.component.scss']
})
export class ModuleComponentsComponent extends BaseListComponent implements OnInit {

  readonly kojiUrl: string = environment.kojiUrl;
  components: Array<MbsComponent> = [];
  moduleID: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moduleService: ModuleService
  ) {
    super();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.processRouteParams(params);
      this.components = [];
      this.exhausted = false;
      this.currentPage = 1;
      const routeParams = this.route.snapshot.params;
      let moduleID = null;
      if (routeParams.id) {
        moduleID = parseInt(routeParams.id, 10);
        if (isNaN(moduleID)) {
          moduleID = null;
          // Redirect to /components if moduleID is not a number
          this.router.navigate(['/components']);
        }
      }
      this.moduleID = moduleID;
      this.getComponents();
    });
  }

  getComponents(): void {
    if (!this.exhausted && !this.loading) {
      this.loading = true;
      this.moduleService.getComponents(this.currentPage, this.orderBy, this.orderDirection, this.moduleID).subscribe(
        data => {
          if (data.items.length) {
            this.components = this.components.concat(data.items);
            this.currentPage += 1;
          } else {
            this.exhausted = true;
          }
        },
        error => {
          console.error(error);
        },
        () => {
          this.loading = false;
        }
      );
    }
  }

  getStateCssClass(component: MbsComponent): string {
    switch (component.state_name) {
      case 'COMPLETE':
        return 'text-success';
      case 'FAILED':
        return 'text-danger';
      case 'CANCELED':
      case 'DELETED':
        return 'text-warning';
      default :
        return 'text-info';
    }
  }

  onScrollDown () {
    this.getComponents();
  }

}
