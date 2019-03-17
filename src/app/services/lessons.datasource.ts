import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { Observable } from "rxjs/internal/Observable";
import { Lesson } from "../model/lesson";
import { CoursesService } from "./courses.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { catchError } from "rxjs/internal/operators/catchError";
import { of } from "rxjs/internal/observable/of";
import { finalize } from "rxjs/internal/operators/finalize";

/* Facilitador para implementação de acesso aos dados com tabelas */
export class LessonsDataSource implements DataSource<Lesson> {

    /* BehaviorSubject extends de Observable e permite alterarmos objetos em tempo de execução e usar entre componentes */
    private lessonsSubject = new BehaviorSubject<Lesson[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);
    
    /* Criando observador de BehaviorSubject */
    public loading$ = this.loadingSubject.asObservable();
    
    constructor(private coursesService: CoursesService) {}

    /* Quando o component se conectar devolva o atributo BehaviorSubject como Observable */
    connect(collectionViewer: CollectionViewer): Observable<Lesson[]>{
        return this.lessonsSubject.asObservable();
    }

    /* Método que ficará responsável pelas filtragens */
    loadLessons(courseId: number, 
                filter: string, 
                sortDirection: string, 
                pageIndex: number, 
                pageSize: number) {
                    this.loadingSubject.next(true);
                    this.coursesService.findLessons(courseId, filter, sortDirection, pageIndex, pageSize)
                        .pipe(
                            catchError(() => of([])),
                            finalize(() => this.loadingSubject.next(false))
                        )
                        .subscribe(lessons => this.lessonsSubject.next(lessons));
    }

    disconnect(collectionViewer: CollectionViewer): void {
        /* Encerrando os BehaviorSubject */
        this.lessonsSubject.complete();
        this.loadingSubject.complete();
    }
}